-- CreateTable
CREATE TABLE "faqs" (
    "faqId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("faqId")
);

-- CreateTable
CREATE TABLE "store_info" (
    "storeInfoId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "website" TEXT,
    "openingTime" TEXT,
    "closingTime" TEXT,
    "description" TEXT,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "youtubeUrl" TEXT,
    "shippingCharge" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "freeShippingAbove" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_info_pkey" PRIMARY KEY ("storeInfoId")
);
