-- AlterTable
ALTER TABLE "form_submissions" ADD COLUMN     "currentStep" INTEGER DEFAULT 0,
ADD COLUMN     "submittedAt" TIMESTAMP(3);
