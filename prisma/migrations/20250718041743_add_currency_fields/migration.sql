-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegramUsername" TEXT NOT NULL,
    "telegramName" TEXT NOT NULL,
    "telegramAvatarUrl" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "fiatCurrency" TEXT NOT NULL DEFAULT 'RUB',
    "cryptoCurrency" TEXT,
    "cryptoAmount" REAL,
    "exchangeRate" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT NOT NULL,
    "invoiceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Order" ("createdAt", "id", "invoiceId", "paymentMethod", "price", "stars", "status", "telegramAvatarUrl", "telegramName", "telegramUsername", "updatedAt") SELECT "createdAt", "id", "invoiceId", "paymentMethod", "price", "stars", "status", "telegramAvatarUrl", "telegramName", "telegramUsername", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_invoiceId_key" ON "Order"("invoiceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
