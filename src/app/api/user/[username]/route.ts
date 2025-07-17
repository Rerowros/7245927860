// app/api/user/[username]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";

// Store these in environment variables
const apiId = parseInt(process.env.NEXT_PUBLIC_TELEGRAM_API_ID || "");
const apiHash = process.env.NEXT_PUBLIC_TELEGRAM_API_HASH || "";
const session = new StringSession(process.env.TELEGRAM_SESSION || "");

// Singleton client to avoid re-login on every request
// Эта переменная будет "жить" между вызовами API в "теплой" serverless-функции
let telegramClient: TelegramClient | null = null;

async function getClient() {
    // 1. Если клиент уже создан и подключен, просто возвращаем его.
    if (telegramClient && telegramClient.connected && !telegramClient.isDisconnected) {
        console.log("Reusing existing connected Telegram client.");
        return telegramClient;
    }

    // 2. Если клиент не создан или отключился, создаем новый.
    console.log("Creating or reconnecting Telegram client...");
    const client = new TelegramClient(session, apiId, apiHash, {
        connectionRetries: 5,
        // Эта опция важна - она позволяет клиенту автоматически переподключаться
        // если соединение было потеряно.
        autoReconnect: true, 
    });

    await client.connect();

    const isAuth = await client.isUserAuthorized();
    console.log(`Telegram client connected. Authorized: ${isAuth}`);

    if (!isAuth) {
        // Это серьезная ошибка, означающая, что сессия невалидна.
        throw new Error("Telegram session is invalid or expired. Please regenerate the session string.");
    }
    
    // Сохраняем созданный клиент в глобальной переменной для переиспользования
    telegramClient = client;
    return telegramClient;
}

export async function GET(
    req: NextRequest,
    { params }: { params: { username: string } }
) {
    // Исправляем warning от Next.js. Просто деструктурируем params внутри функции.
    let rawUsername = params.username;

    if (!rawUsername) {
        return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
    }

    // --- НАЧАЛО ЗАЩИТЫ ОТ ДУРАЧКА ---
    let cleanUsername = rawUsername.trim();

    if (cleanUsername.startsWith('@')) {
        cleanUsername = cleanUsername.substring(1);
    }

    try {
        const url = new URL(cleanUsername);
        if (url.hostname === 't.me' || url.hostname === 'telegram.me') {
            const path = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
            if (path) {
                cleanUsername = path.split('/')[0]; // Берем только первую часть пути, на случай ссылок типа t.me/channel/123
            }
        }
    } catch (e) {
        // Не URL, все в порядке.
    }
    // --- КОНЕЦ ЗАЩИТЫ ОТ ДУРАЧКА ---

    try {
        const client = await getClient();
        
        const entity = await client.getEntity(cleanUsername); 
        
        let avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${cleanUsername}`;
        let fullName = cleanUsername;

        if (entity instanceof Api.User && entity.photo) {
            const photoBuffer = await client.downloadProfilePhoto(entity, { isBig: true });

            if (photoBuffer && photoBuffer.length > 0) {
                const base64Image = Buffer.from(photoBuffer).toString('base64');
                avatarUrl = `data:image/jpeg;base64,${base64Image}`;
            }
        }
        
        if (entity instanceof Api.User) {
           fullName = `${entity.firstName || ''} ${entity.lastName || ''}`.trim() || entity.username || '';
        } else if (entity instanceof Api.Channel) {
            fullName = entity.title;
        }

        return NextResponse.json({
            success: true,
            username: (entity as any).username || cleanUsername,
            exists: true,
            name: fullName,
            avatar_url: avatarUrl,
        });

    } catch (error: any) {
        console.error(`Error checking username @${cleanUsername}:`, error.message);
        if (error.message.includes('USERNAME_NOT_OCCUPIED') || error.message.includes('No user has')) {
            return NextResponse.json({ success: true, username: cleanUsername, exists: false });
        }
        return NextResponse.json({ success: false, error: error.message || "An internal error occurred" }, { status: 500 });
    }
}