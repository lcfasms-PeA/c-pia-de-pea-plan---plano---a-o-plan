CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(10),
	`category` varchar(30),
	`pointsRequired` int,
	`sectionsRequired` int,
	`daysAdvance` int,
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `businessPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`classId` int,
	`title` varchar(200),
	`status` varchar(30) DEFAULT 'rascunho',
	`data` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `businessPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `canvasModels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`customerSegments` json,
	`valuePropositions` json,
	`channels` json,
	`customerRelationships` json,
	`revenueStreams` json,
	`keyResources` json,
	`keyActivities` json,
	`keyPartnerships` json,
	`costStructure` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `canvasModels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`institutionId` int NOT NULL,
	`professorId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`enrollmentType` varchar(30) DEFAULT 'InstituicaoEnsino',
	`startDate` date,
	`endDate` date,
	`status` varchar(20) DEFAULT 'Ativa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`studentId` int NOT NULL,
	`enrollmentDate` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `institutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` varchar(30) DEFAULT 'InstituicaoEnsino',
	`cnpj` varchar(20),
	`email` varchar(100),
	`phone` varchar(20),
	`status` varchar(20) DEFAULT 'Ativa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `institutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`fileUrl` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(100) NOT NULL,
	`message` text,
	`type` varchar(30),
	`severity` varchar(20) DEFAULT 'Info',
	`read` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pointsHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`points` int NOT NULL,
	`reason` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pointsHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resourceCapture` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`amount` decimal(12,2),
	`link` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `resourceCapture_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riskAnalysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`description` text NOT NULL,
	`probability` int,
	`impact` int,
	`mitigation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riskAnalysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`task` varchar(200) NOT NULL,
	`startDate` date,
	`endDate` date,
	`responsibleId` int,
	`status` varchar(20) DEFAULT 'Pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `swotAnalysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`strengths` json,
	`weaknesses` json,
	`opportunities` json,
	`threats` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `swotAnalysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `themes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`institutionId` int NOT NULL,
	`primaryColor` varchar(7) DEFAULT '#1E3A5F',
	`secondaryColor` varchar(7) DEFAULT '#2E7D32',
	`accentColor` varchar(7) DEFAULT '#F57C00',
	`backgroundColor` varchar(7) DEFAULT '#F5F7FA',
	`textColor` varchar(7) DEFAULT '#1E293B',
	`primaryFont` varchar(50) DEFAULT 'Poppins',
	`titleFont` varchar(50) DEFAULT 'Montserrat',
	`logoUrl` varchar(255),
	`bannerUrl` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `themes_id` PRIMARY KEY(`id`),
	CONSTRAINT `themes_institutionId_unique` UNIQUE(`institutionId`)
);
--> statement-breakpoint
CREATE TABLE `userAchievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` int NOT NULL,
	`achievedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userAchievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userScores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`points` int DEFAULT 0,
	`level` int DEFAULT 1,
	`xp` int DEFAULT 0,
	`medals` int DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userScores_id` PRIMARY KEY(`id`),
	CONSTRAINT `userScores_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin_geral','coordenador','professor','aluno_individual','aluno_lider','aluno_editor','aluno_visualizador','user','admin') NOT NULL DEFAULT 'aluno_individual';--> statement-breakpoint
ALTER TABLE `users` ADD `institutionId` int;--> statement-breakpoint
ALTER TABLE `users` ADD `status` varchar(20) DEFAULT 'Ativo';--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `businessPlans` ADD CONSTRAINT `businessPlans_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `businessPlans` ADD CONSTRAINT `businessPlans_classId_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `canvasModels` ADD CONSTRAINT `canvasModels_planId_businessPlans_id_fk` FOREIGN KEY (`planId`) REFERENCES `businessPlans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classes` ADD CONSTRAINT `classes_institutionId_institutions_id_fk` FOREIGN KEY (`institutionId`) REFERENCES `institutions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classes` ADD CONSTRAINT `classes_professorId_users_id_fk` FOREIGN KEY (`professorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_classId_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_studentId_users_id_fk` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_classId_classes_id_fk` FOREIGN KEY (`classId`) REFERENCES `classes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pointsHistory` ADD CONSTRAINT `pointsHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resourceCapture` ADD CONSTRAINT `resourceCapture_planId_businessPlans_id_fk` FOREIGN KEY (`planId`) REFERENCES `businessPlans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `riskAnalysis` ADD CONSTRAINT `riskAnalysis_planId_businessPlans_id_fk` FOREIGN KEY (`planId`) REFERENCES `businessPlans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_planId_businessPlans_id_fk` FOREIGN KEY (`planId`) REFERENCES `businessPlans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `schedules` ADD CONSTRAINT `schedules_responsibleId_users_id_fk` FOREIGN KEY (`responsibleId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `swotAnalysis` ADD CONSTRAINT `swotAnalysis_planId_businessPlans_id_fk` FOREIGN KEY (`planId`) REFERENCES `businessPlans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `themes` ADD CONSTRAINT `themes_institutionId_institutions_id_fk` FOREIGN KEY (`institutionId`) REFERENCES `institutions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAchievements` ADD CONSTRAINT `userAchievements_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userAchievements` ADD CONSTRAINT `userAchievements_achievementId_achievements_id_fk` FOREIGN KEY (`achievementId`) REFERENCES `achievements`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userScores` ADD CONSTRAINT `userScores_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_institutionId_institutions_id_fk` FOREIGN KEY (`institutionId`) REFERENCES `institutions`(`id`) ON DELETE no action ON UPDATE no action;