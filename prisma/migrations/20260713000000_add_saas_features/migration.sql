-- AlterTable: Add missing fields to User
ALTER TABLE "User" ADD COLUMN "lockoutUntil" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

-- AlterTable: Add missing fields to ChatConversation
ALTER TABLE "ChatConversation" ADD COLUMN "assignedTo" TEXT;

-- AlterTable: Add indexes to Booking
CREATE INDEX "Booking_guestId_idx" ON "Booking"("guestId");
CREATE INDEX "Booking_cottageId_idx" ON "Booking"("cottageId");
CREATE INDEX "Booking_status_idx" ON "Booking"("status");
CREATE INDEX "Booking_checkIn_checkOut_idx" ON "Booking"("checkIn", "checkOut");
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");

-- AlterTable: Add indexes to Review (will be created with the table)

-- AlterTable: Add indexes to CafeOrder (will be created with the table)

-- CreateTable: Property
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "logo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- CreateTable: GuestProfile
CREATE TABLE "GuestProfile" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "idType" TEXT,
    "idNumber" TEXT,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "dietaryRestrictions" TEXT,
    "specialDates" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "totalStays" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'BRONZE',
    "referredBy" TEXT,
    "referralCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestProfile_guestId_key" ON "GuestProfile"("guestId");
CREATE UNIQUE INDEX "GuestProfile_referralCode_key" ON "GuestProfile"("referralCode");

-- CreateTable: Review
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "bookingId" TEXT,
    "cottageId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "pros" TEXT,
    "cons" TEXT,
    "source" TEXT NOT NULL DEFAULT 'WEBSITE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "adminReply" TEXT,
    "repliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_guestId_idx" ON "Review"("guestId");
CREATE INDEX "Review_cottageId_idx" ON "Review"("cottageId");
CREATE INDEX "Review_isVisible_idx" ON "Review"("isVisible");

-- CreateTable: LoyaltyTransaction
CREATE TABLE "LoyaltyTransaction" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "bookingId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoyaltyTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LoyaltyTransaction_guestId_idx" ON "LoyaltyTransaction"("guestId");

-- CreateTable: Referral
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerCode" TEXT NOT NULL,
    "refereeEmail" TEXT NOT NULL,
    "refereeName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rewardPoints" INTEGER NOT NULL DEFAULT 500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Referral_referrerCode_idx" ON "Referral"("referrerCode");
CREATE INDEX "Referral_refereeEmail_idx" ON "Referral"("refereeEmail");

-- CreateTable: PricingRule
CREATE TABLE "PricingRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "minStay" INTEGER,
    "maxStay" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PricingRule_type_isActive_idx" ON "PricingRule"("type", "isActive");

-- CreateTable: StaffShift
CREATE TABLE "StaffShift" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "shiftType" TEXT NOT NULL DEFAULT 'DAY',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffShift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffShift_staffId_date_idx" ON "StaffShift"("staffId", "date");

-- CreateTable: StaffAttendance
CREATE TABLE "StaffAttendance" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PRESENT',
    "hoursWorked" DOUBLE PRECISION,
    "overtime" DOUBLE PRECISION DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffAttendance_staffId_date_idx" ON "StaffAttendance"("staffId", "date");
CREATE UNIQUE INDEX "StaffAttendance_staffId_date_key" ON "StaffAttendance"("staffId", "date");

-- CreateTable: CafeInventory
CREATE TABLE "CafeInventory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "minStock" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "maxStock" DOUBLE PRECISION,
    "costPerUnit" DOUBLE PRECISION,
    "supplier" TEXT,
    "lastRestocked" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CafeInventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CafeInventory_category_isActive_idx" ON "CafeInventory"("category", "isActive");

-- CreateTable: CafeInventoryLog
CREATE TABLE "CafeInventoryLog" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "reason" TEXT,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CafeInventoryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CafeInventoryLog_inventoryId_createdAt_idx" ON "CafeInventoryLog"("inventoryId", "createdAt");

-- AddForeignKey
ALTER TABLE "CafeInventoryLog" ADD CONSTRAINT "CafeInventoryLog_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "CafeInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Webhook
CREATE TABLE "Webhook" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" JSONB NOT NULL,
    "secret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggered" TIMESTAMP(3),
    "failCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WebhookDelivery
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "response" JSONB,
    "statusCode" INTEGER,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookDelivery_webhookId_createdAt_idx" ON "WebhookDelivery"("webhookId", "createdAt");

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Document
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "description" TEXT,
    "expiresAt" TIMESTAMP(3),
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_category_idx" ON "Document"("category");

-- CreateTable: Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- AddForeignKey: Property relations
ALTER TABLE "Cottage" ADD CONSTRAINT "Cottage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: GuestProfile relations
ALTER TABLE "GuestProfile" ADD CONSTRAINT "GuestProfile_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Review relations
ALTER TABLE "Review" ADD CONSTRAINT "Review_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "GuestProfile"("guestId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_cottageId_fkey" FOREIGN KEY ("cottageId") REFERENCES "Cottage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: LoyaltyTransaction relations
ALTER TABLE "LoyaltyTransaction" ADD CONSTRAINT "LoyaltyTransaction_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "GuestProfile"("guestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: StaffShift relations
ALTER TABLE "StaffShift" ADD CONSTRAINT "StaffShift_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: StaffAttendance relations
ALTER TABLE "StaffAttendance" ADD CONSTRAINT "StaffAttendance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: SeasonalPricing index
CREATE INDEX "SeasonalPricing_cottageId_idx" ON "SeasonalPricing"("cottageId");

-- AddForeignKey: CafeOrder indexes
CREATE INDEX "CafeOrder_status_idx" ON "CafeOrder"("status");
CREATE INDEX "CafeOrder_createdAt_idx" ON "CafeOrder"("createdAt");
