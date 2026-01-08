/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(5);
const app_controller_1 = __webpack_require__(6);
const app_service_1 = __webpack_require__(7);
const users_module_1 = __webpack_require__(16);
const tasks_module_1 = __webpack_require__(24);
const auth_module_1 = __webpack_require__(38);
const organizations_module_1 = __webpack_require__(36);
const user_entity_1 = __webpack_require__(12);
const task_entity_1 = __webpack_require__(13);
const organization_entity_1 = __webpack_require__(10);
const user_organization_entity_1 = __webpack_require__(11);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'postgres',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                username: process.env.POSTGRES_USER || 'user',
                password: process.env.POSTGRES_PASSWORD || 'password',
                database: process.env.POSTGRES_DB || 'taskdb',
                entities: [user_entity_1.User, task_entity_1.Task, organization_entity_1.Organization, user_organization_entity_1.UserOrganization],
                synchronize: true,
            }),
            users_module_1.UsersModule,
            tasks_module_1.TasksModule,
            auth_module_1.AuthModule,
            organizations_module_1.OrganizationsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const app_service_1 = __webpack_require__(7);
const typeorm_1 = __webpack_require__(8);
const organizations_service_1 = __webpack_require__(9);
let AppController = class AppController {
    constructor(appService, dataSource, organizationsService) {
        this.appService = appService;
        this.dataSource = dataSource;
        this.organizationsService = organizationsService;
    }
    getData() {
        return this.appService.getData();
    }
    // DEVELOPMENT ONLY - DELETE BEFORE PRODUCTION
    // Clears all data from the database
    async clearDatabase() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Use TRUNCATE CASCADE to handle foreign key constraints
            // This will truncate all tables and cascade to dependent tables
            await queryRunner.query('TRUNCATE TABLE "user_organizations", "task", "user", "organization" CASCADE');
            await queryRunner.commitTransaction();
            return { message: 'Database cleared successfully' };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    // DEVELOPMENT ONLY - Backfills existing tasks with a default organization
    async backfillTasks() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Get or create a default organization
            const defaultOrg = await this.organizationsService.findOrCreateDefault();
            // Update all tasks without an organizationId
            await queryRunner.query('UPDATE "task" SET "organizationId" = $1 WHERE "organizationId" IS NULL', [defaultOrg.id]);
            await queryRunner.commitTransaction();
            return { message: `Backfilled tasks with organization: ${defaultOrg.id}` };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
tslib_1.__decorate([
    (0, common_1.Get)('clear'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "clearDatabase", null);
tslib_1.__decorate([
    (0, common_1.Get)('backfill-tasks'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], AppController.prototype, "backfillTasks", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object, typeof (_b = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _b : Object, typeof (_c = typeof organizations_service_1.OrganizationsService !== "undefined" && organizations_service_1.OrganizationsService) === "function" ? _c : Object])
], AppController);


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
let AppService = class AppService {
    getData() {
        return { message: 'Hello API' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationsService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(5);
const typeorm_2 = __webpack_require__(8);
const organization_entity_1 = __webpack_require__(10);
const user_organization_entity_1 = __webpack_require__(11);
const data_1 = __webpack_require__(14);
let OrganizationsService = class OrganizationsService {
    constructor(organizationsRepository, userOrganizationRepository) {
        this.organizationsRepository = organizationsRepository;
        this.userOrganizationRepository = userOrganizationRepository;
    }
    async create(name, parentId) {
        const org = this.organizationsRepository.create({ name, parentId });
        return this.organizationsRepository.save(org);
    }
    async findOne(id) {
        return this.organizationsRepository.findOneBy({ id });
    }
    async getOrganizationCount() {
        return await this.organizationsRepository.count();
    }
    async findOrCreateDefault() {
        // Try to find a default organization
        let org = await this.organizationsRepository.findOne({ where: { name: 'Default Organization' } });
        if (!org) {
            org = await this.create('Default Organization');
        }
        return org;
    }
    async update(id, name) {
        const org = await this.findOne(id);
        if (!org) {
            throw new Error('Organization not found');
        }
        org.name = name;
        return this.organizationsRepository.save(org);
    }
    async addUserToOrganization(userId, organizationId, role) {
        // Check if relationship already exists
        let userOrg = await this.userOrganizationRepository.findOne({
            where: { userId, organizationId },
        });
        if (userOrg) {
            // Update existing role
            userOrg.role = role;
            return this.userOrganizationRepository.save(userOrg);
        }
        // Create new relationship
        userOrg = this.userOrganizationRepository.create({
            userId,
            organizationId,
            role,
        });
        const saved = await this.userOrganizationRepository.save(userOrg);
        // Verify it was saved correctly
        const verify = await this.userOrganizationRepository.findOne({
            where: { userId, organizationId },
        });
        if (!verify) {
            throw new Error(`Failed to save UserOrganization relationship: userId=${userId}, organizationId=${organizationId}, role=${role}`);
        }
        return saved;
    }
    async getUserOrganizations(userId, currentOrgId) {
        // First, try to get organizations from UserOrganization join table
        const userOrgs = await this.userOrganizationRepository.find({
            where: { userId },
            relations: ['organization'],
        });
        if (userOrgs.length > 0) {
            return userOrgs.map(uo => uo.organization);
        }
        // Fallback: If no UserOrganization entries exist (migration scenario),
        // find organizations from tasks where user is assignee, or from currentOrgId in JWT
        const { Task } = await Promise.resolve().then(() => tslib_1.__importStar(__webpack_require__(13)));
        const taskRepository = this.organizationsRepository.manager.getRepository(Task);
        // Find tasks where user is assignee
        const assignedTasks = await taskRepository.find({
            where: { assigneeId: userId },
            select: ['organizationId'],
        });
        // Get unique organization IDs from assigned tasks
        let orgIds = [...new Set(assignedTasks.map(t => t.organizationId).filter(Boolean))];
        // Also include currentOrgId from JWT if provided
        if (currentOrgId && !orgIds.includes(currentOrgId)) {
            orgIds.push(currentOrgId);
        }
        // If still no orgs found, find all unique orgs from all tasks (migration fallback)
        if (orgIds.length === 0) {
            const allTasks = await taskRepository.find({
                select: ['organizationId'],
            });
            orgIds = [...new Set(allTasks.map(t => t.organizationId).filter(Boolean))];
        }
        if (orgIds.length === 0) {
            return [];
        }
        // Find the organizations
        const organizations = await this.organizationsRepository.find({
            where: orgIds.map(id => ({ id })),
        });
        // Create UserOrganization entries for these organizations
        // For existing data, we'll make the user OWNER of organizations they have tasks in
        for (const org of organizations) {
            const existing = await this.userOrganizationRepository.findOne({
                where: { userId, organizationId: org.id },
            });
            if (!existing) {
                await this.addUserToOrganization(userId, org.id, data_1.Role.OWNER);
            }
        }
        // Return the organizations with fresh UserOrganization entries
        const updatedUserOrgs = await this.userOrganizationRepository.find({
            where: { userId },
            relations: ['organization'],
        });
        return updatedUserOrgs.map(uo => uo.organization);
    }
    async getUserRoleInOrganization(userId, organizationId) {
        const userOrg = await this.userOrganizationRepository.findOne({
            where: { userId, organizationId },
        });
        if (!userOrg) {
            // Debug logging to help diagnose issues
            console.log(`[DEBUG] getUserRoleInOrganization: No UserOrganization found for userId=${userId}, organizationId=${organizationId}`);
            // Check if organization exists
            const org = await this.findOne(organizationId);
            if (!org) {
                console.log(`[DEBUG] Organization ${organizationId} does not exist`);
            }
            else {
                // Check all user-org relationships for this org
                const allUserOrgs = await this.userOrganizationRepository.find({
                    where: { organizationId },
                });
                console.log(`[DEBUG] Organization ${organizationId} has ${allUserOrgs.length} user relationships:`, allUserOrgs.map(uo => ({ userId: uo.userId, role: uo.role })));
            }
        }
        return userOrg ? userOrg.role : null;
    }
    async getOrganizationWithRoles(organizationId) {
        const org = await this.findOne(organizationId);
        if (!org) {
            throw new Error('Organization not found');
        }
        const userOrgs = await this.userOrganizationRepository.find({
            where: { organizationId },
        });
        const roles = {};
        userOrgs.forEach(uo => {
            roles[uo.userId] = uo.role;
        });
        return { ...org, roles };
    }
    async getOrganizationMembers(organizationId) {
        const userOrgs = await this.userOrganizationRepository.find({
            where: { organizationId },
        });
        // Get user details for each member
        const { User } = await Promise.resolve().then(() => tslib_1.__importStar(__webpack_require__(12)));
        const userRepository = this.organizationsRepository.manager.getRepository(User);
        const members = await Promise.all(userOrgs.map(async (uo) => {
            const user = await userRepository.findOne({ where: { id: uo.userId } });
            return {
                userId: uo.userId,
                role: uo.role,
                email: user?.email || null,
            };
        }));
        return members;
    }
    async updateUserRoleInOrganization(organizationId, userId, role) {
        const userOrg = await this.userOrganizationRepository.findOne({
            where: { userId, organizationId },
        });
        if (!userOrg) {
            throw new Error('User is not a member of this organization');
        }
        userOrg.role = role;
        return this.userOrganizationRepository.save(userOrg);
    }
    async removeUserFromOrganization(organizationId, userId) {
        const userOrg = await this.userOrganizationRepository.findOne({
            where: { userId, organizationId },
        });
        if (!userOrg) {
            throw new Error('User is not a member of this organization');
        }
        return this.userOrganizationRepository.remove(userOrg);
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(organization_entity_1.Organization)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(user_organization_entity_1.UserOrganization)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], OrganizationsService);


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Organization = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(8);
const user_organization_entity_1 = __webpack_require__(11);
let Organization = class Organization {
};
exports.Organization = Organization;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], Organization.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Organization.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Organization.prototype, "parentId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => Organization, (org) => org.children),
    tslib_1.__metadata("design:type", Organization)
], Organization.prototype, "parent", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => Organization, (org) => org.parent),
    tslib_1.__metadata("design:type", Array)
], Organization.prototype, "children", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => user_organization_entity_1.UserOrganization, (userOrg) => userOrg.organization),
    tslib_1.__metadata("design:type", Array)
], Organization.prototype, "userOrganizations", void 0);
exports.Organization = Organization = tslib_1.__decorate([
    (0, typeorm_1.Entity)()
], Organization);


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserOrganization = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(8);
const user_entity_1 = __webpack_require__(12);
const organization_entity_1 = __webpack_require__(10);
let UserOrganization = class UserOrganization {
};
exports.UserOrganization = UserOrganization;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], UserOrganization.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], UserOrganization.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], UserOrganization.prototype, "organizationId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], UserOrganization.prototype, "role", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _a : Object)
], UserOrganization.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization),
    (0, typeorm_1.JoinColumn)({ name: 'organizationId' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof organization_entity_1.Organization !== "undefined" && organization_entity_1.Organization) === "function" ? _b : Object)
], UserOrganization.prototype, "organization", void 0);
exports.UserOrganization = UserOrganization = tslib_1.__decorate([
    (0, typeorm_1.Entity)('user_organizations'),
    (0, typeorm_1.Unique)(['userId', 'organizationId'])
], UserOrganization);


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(8);
const task_entity_1 = __webpack_require__(13);
const user_organization_entity_1 = __webpack_require__(11);
let User = class User {
};
exports.User = User;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], User.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "email", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], User.prototype, "password", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (task) => task.assignee),
    tslib_1.__metadata("design:type", Array)
], User.prototype, "tasks", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => user_organization_entity_1.UserOrganization, (userOrg) => userOrg.user),
    tslib_1.__metadata("design:type", Array)
], User.prototype, "userOrganizations", void 0);
exports.User = User = tslib_1.__decorate([
    (0, typeorm_1.Entity)()
], User);


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Task = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(8);
const user_entity_1 = __webpack_require__(12);
const organization_entity_1 = __webpack_require__(10);
let Task = class Task {
};
exports.Task = Task;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], Task.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Task.prototype, "title", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Task.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ default: 'OPEN' }),
    tslib_1.__metadata("design:type", String)
], Task.prototype, "status", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Task.prototype, "organizationId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Task.prototype, "assigneeId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true, default: null }),
    tslib_1.__metadata("design:type", Array)
], Task.prototype, "tags", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Task.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Task.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.tasks),
    (0, typeorm_1.JoinColumn)({ name: 'assigneeId' }),
    tslib_1.__metadata("design:type", typeof (_c = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _c : Object)
], Task.prototype, "assignee", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => organization_entity_1.Organization),
    (0, typeorm_1.JoinColumn)({ name: 'organizationId' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof organization_entity_1.Organization !== "undefined" && organization_entity_1.Organization) === "function" ? _d : Object)
], Task.prototype, "organization", void 0);
exports.Task = Task = tslib_1.__decorate([
    (0, typeorm_1.Entity)()
], Task);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(4);
tslib_1.__exportStar(__webpack_require__(15), exports);


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Role = void 0;
var Role;
(function (Role) {
    Role["OWNER"] = "OWNER";
    Role["ADMIN"] = "ADMIN";
    Role["VIEWER"] = "VIEWER";
})(Role || (exports.Role = Role = {}));


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(5);
const users_service_1 = __webpack_require__(17);
const users_controller_1 = __webpack_require__(19);
const user_entity_1 = __webpack_require__(12);
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User])],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService],
        exports: [users_service_1.UsersService],
    })
], UsersModule);


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(5);
const typeorm_2 = __webpack_require__(8);
const user_entity_1 = __webpack_require__(12);
const bcrypt = tslib_1.__importStar(__webpack_require__(18));
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async create(createUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });
        return this.usersRepository.save(user);
    }
    findAll() {
        return this.usersRepository.find();
    }
    findOne(id) {
        return this.usersRepository.findOneBy({ id });
    }
    findByEmail(email) {
        return this.usersRepository.findOneBy({ email });
    }
    async update(id, updateUserDto) {
        await this.usersRepository.update(id, updateUserDto);
        return this.findOne(id);
    }
    remove(id) {
        return this.usersRepository.delete(id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], UsersService);


/***/ }),
/* 18 */
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const users_service_1 = __webpack_require__(17);
const create_user_dto_1 = __webpack_require__(20);
const update_user_dto_1 = __webpack_require__(22);
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    findAll() {
        return this.usersService.findAll();
    }
    findOne(id) {
        return this.usersService.findOne(id);
    }
    update(id, updateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    remove(id) {
        return this.usersService.remove(id);
    }
};
exports.UsersController = UsersController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof create_user_dto_1.CreateUserDto !== "undefined" && create_user_dto_1.CreateUserDto) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_c = typeof update_user_dto_1.UpdateUserDto !== "undefined" && update_user_dto_1.UpdateUserDto) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String]),
    tslib_1.__metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = tslib_1.__decorate([
    (0, common_1.Controller)('users'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object])
], UsersController);


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateUserDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(21);
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
tslib_1.__decorate([
    (0, class_validator_1.IsEmail)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateUserDto.prototype, "organizationId", void 0);


/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateUserDto = void 0;
const mapped_types_1 = __webpack_require__(23);
const create_user_dto_1 = __webpack_require__(20);
class UpdateUserDto extends (0, mapped_types_1.PartialType)(create_user_dto_1.CreateUserDto) {
}
exports.UpdateUserDto = UpdateUserDto;


/***/ }),
/* 23 */
/***/ ((module) => {

module.exports = require("@nestjs/mapped-types");

/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TasksModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(5);
const tasks_service_1 = __webpack_require__(25);
const tasks_controller_1 = __webpack_require__(26);
const task_entity_1 = __webpack_require__(13);
const organizations_module_1 = __webpack_require__(36);
let TasksModule = class TasksModule {
};
exports.TasksModule = TasksModule;
exports.TasksModule = TasksModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([task_entity_1.Task]), organizations_module_1.OrganizationsModule],
        controllers: [tasks_controller_1.TasksController],
        providers: [tasks_service_1.TasksService],
    })
], TasksModule);


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TasksService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(5);
const typeorm_2 = __webpack_require__(8);
const task_entity_1 = __webpack_require__(13);
const data_1 = __webpack_require__(14);
const organizations_service_1 = __webpack_require__(9);
let TasksService = class TasksService {
    constructor(tasksRepository, organizationsService) {
        this.tasksRepository = tasksRepository;
        this.organizationsService = organizationsService;
    }
    async create(createTaskDto, user) {
        // Use organizationId from DTO if provided, otherwise use user's current organization
        const organizationId = createTaskDto.organizationId || user.orgId;
        if (!organizationId) {
            throw new common_1.ForbiddenException('Organization ID is required');
        }
        // Verify user has access to this organization
        const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, organizationId);
        if (!userRole) {
            throw new common_1.ForbiddenException(`You do not have access to this organization. User: ${user.userId}, Org: ${organizationId}`);
        }
        // Check if user can create tasks (VIEWER cannot)
        if (userRole === data_1.Role.VIEWER) {
            throw new common_1.ForbiddenException('Viewers cannot create tasks');
        }
        const task = this.tasksRepository.create({
            ...createTaskDto,
            organizationId,
            tags: createTaskDto.tags || [],
        });
        return this.tasksRepository.save(task);
    }
    async findAll(user) {
        // Get all organizations the user has access to (VIEW or higher)
        const userOrganizations = await this.organizationsService.getUserOrganizations(user.userId);
        // Extract organization IDs
        const organizationIds = userOrganizations.map(org => org.id);
        // If user has no organizations, return empty array
        if (organizationIds.length === 0) {
            return [];
        }
        // Return tasks from all organizations the user has access to
        return this.tasksRepository.find({
            where: { organizationId: (0, typeorm_2.In)(organizationIds) },
            relations: ['assignee', 'organization'],
        });
    }
    async findOne(id, user) {
        // Get all organizations the user has access to
        const userOrganizations = await this.organizationsService.getUserOrganizations(user.userId);
        const organizationIds = userOrganizations.map(org => org.id);
        // Find task and verify it belongs to one of the user's organizations
        const task = await this.tasksRepository.findOne({
            where: { id },
            relations: ['assignee', 'organization'],
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task #${id} not found`);
        }
        // Check if user has access to this task's organization
        if (!organizationIds.includes(task.organizationId)) {
            throw new common_1.ForbiddenException('You do not have access to this task');
        }
        return task;
    }
    async update(id, updateTaskDto, user) {
        const task = await this.findOne(id, user);
        // Get user's role in the task's organization
        const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, task.organizationId);
        if (userRole === data_1.Role.VIEWER) {
            throw new common_1.ForbiddenException('Viewers cannot update tasks');
        }
        console.log(`[AUDIT] User ${user.username} (${userRole}) updated task ${id}`);
        Object.assign(task, {
            ...updateTaskDto,
            tags: updateTaskDto.tags || [],
        });
        return this.tasksRepository.save(task);
    }
    async remove(id, user) {
        const task = await this.findOne(id, user);
        // Get user's role in the task's organization
        const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, task.organizationId);
        if (userRole === data_1.Role.VIEWER) {
            throw new common_1.ForbiddenException('Viewers cannot delete tasks');
        }
        console.log(`[AUDIT] User ${user.username} (${userRole}) deleted task ${id}`);
        return this.tasksRepository.remove(task);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof organizations_service_1.OrganizationsService !== "undefined" && organizations_service_1.OrganizationsService) === "function" ? _b : Object])
], TasksService);


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TasksController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const tasks_service_1 = __webpack_require__(25);
const create_task_dto_1 = __webpack_require__(27);
const update_task_dto_1 = __webpack_require__(28);
const jwt_auth_guard_1 = __webpack_require__(29);
const auth_1 = __webpack_require__(31);
const data_1 = __webpack_require__(14);
let TasksController = class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    create(createTaskDto, user) {
        return this.tasksService.create(createTaskDto, user);
    }
    findAll(user) {
        return this.tasksService.findAll(user);
    }
    findOne(id, user) {
        return this.tasksService.findOne(id, user);
    }
    update(id, updateTaskDto, user) {
        return this.tasksService.update(id, updateTaskDto, user);
    }
    remove(id, user) {
        return this.tasksService.remove(id, user);
    }
};
exports.TasksController = TasksController;
tslib_1.__decorate([
    (0, common_1.Post)(),
    (0, auth_1.Roles)(data_1.Role.OWNER, data_1.Role.ADMIN),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof create_task_dto_1.CreateTaskDto !== "undefined" && create_task_dto_1.CreateTaskDto) === "function" ? _b : Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], TasksController.prototype, "create", null);
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], TasksController.prototype, "findAll", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], TasksController.prototype, "findOne", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, typeof (_c = typeof update_task_dto_1.UpdateTaskDto !== "undefined" && update_task_dto_1.UpdateTaskDto) === "function" ? _c : Object, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], TasksController.prototype, "update", null);
tslib_1.__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_1.Roles)(data_1.Role.OWNER, data_1.Role.ADMIN),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", void 0)
], TasksController.prototype, "remove", null);
exports.TasksController = TasksController = tslib_1.__decorate([
    (0, common_1.Controller)('tasks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, auth_1.RolesGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof tasks_service_1.TasksService !== "undefined" && tasks_service_1.TasksService) === "function" ? _a : Object])
], TasksController);


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateTaskDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_validator_1 = __webpack_require__(21);
class CreateTaskDto {
}
exports.CreateTaskDto = CreateTaskDto;
tslib_1.__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateTaskDto.prototype, "title", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateTaskDto.prototype, "description", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    tslib_1.__metadata("design:type", String)
], CreateTaskDto.prototype, "assigneeId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['OPEN', 'IN_PROGRESS', 'DONE']),
    tslib_1.__metadata("design:type", String)
], CreateTaskDto.prototype, "status", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    tslib_1.__metadata("design:type", String)
], CreateTaskDto.prototype, "organizationId", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    tslib_1.__metadata("design:type", Array)
], CreateTaskDto.prototype, "tags", void 0);


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateTaskDto = void 0;
const mapped_types_1 = __webpack_require__(23);
const create_task_dto_1 = __webpack_require__(27);
class UpdateTaskDto extends (0, mapped_types_1.PartialType)(create_task_dto_1.CreateTaskDto) {
}
exports.UpdateTaskDto = UpdateTaskDto;


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(30);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 30 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(4);
tslib_1.__exportStar(__webpack_require__(32), exports);
tslib_1.__exportStar(__webpack_require__(33), exports);
tslib_1.__exportStar(__webpack_require__(34), exports);
tslib_1.__exportStar(__webpack_require__(35), exports);


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        controllers: [],
        providers: [],
        exports: [],
    })
], AuthModule);


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = __webpack_require__(1);
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesGuard = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const data_1 = __webpack_require__(14);
const roles_decorator_1 = __webpack_require__(33);
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        // Implement role inheritance logic: Owner > Admin > Viewer
        return requiredRoles.some((role) => this.hasPermission(user.role, role));
    }
    hasPermission(userRole, requiredRole) {
        if (userRole === data_1.Role.OWNER)
            return true;
        if (userRole === data_1.Role.ADMIN && requiredRole !== data_1.Role.OWNER)
            return true;
        if (userRole === data_1.Role.VIEWER && requiredRole === data_1.Role.VIEWER)
            return true;
        return false;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CurrentUser = void 0;
const common_1 = __webpack_require__(1);
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});


/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationsModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(5);
const organizations_service_1 = __webpack_require__(9);
const organizations_controller_1 = __webpack_require__(37);
const organization_entity_1 = __webpack_require__(10);
const user_organization_entity_1 = __webpack_require__(11);
const users_module_1 = __webpack_require__(16);
let OrganizationsModule = class OrganizationsModule {
};
exports.OrganizationsModule = OrganizationsModule;
exports.OrganizationsModule = OrganizationsModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([organization_entity_1.Organization, user_organization_entity_1.UserOrganization]), users_module_1.UsersModule],
        controllers: [organizations_controller_1.OrganizationsController],
        providers: [organizations_service_1.OrganizationsService],
        exports: [organizations_service_1.OrganizationsService],
    })
], OrganizationsModule);


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.OrganizationsController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const organizations_service_1 = __webpack_require__(9);
const jwt_auth_guard_1 = __webpack_require__(29);
const auth_1 = __webpack_require__(31);
const users_service_1 = __webpack_require__(17);
const data_1 = __webpack_require__(14);
let OrganizationsController = class OrganizationsController {
    constructor(organizationsService, usersService) {
        this.organizationsService = organizationsService;
        this.usersService = usersService;
    }
    async getUserOrganizations(user) {
        // Return all organizations the user has access to
        // Pass currentOrgId from JWT for migration fallback
        const organizations = await this.organizationsService.getUserOrganizations(user.userId, user.organizationId);
        // Get roles for each organization and format response
        const orgsWithRoles = await Promise.all(organizations.map(async (org) => {
            const orgWithRoles = await this.organizationsService.getOrganizationWithRoles(org.id);
            return orgWithRoles;
        }));
        return orgsWithRoles;
    }
    async createOrganization(body, user) {
        // Create the organization
        const org = await this.organizationsService.create(body.name);
        // Add user as OWNER of the new organization
        const userOrg = await this.organizationsService.addUserToOrganization(user.userId, org.id, data_1.Role.OWNER);
        // Verify the relationship was created successfully
        if (!userOrg) {
            throw new Error('Failed to add user to organization');
        }
        // Double-check the relationship exists before returning
        const verifyRole = await this.organizationsService.getUserRoleInOrganization(user.userId, org.id);
        if (!verifyRole) {
            console.error(`[ERROR] User ${user.userId} was not properly added to organization ${org.id} as OWNER`);
            throw new Error('Failed to verify user-organization relationship');
        }
        // Return organization with roles
        return this.organizationsService.getOrganizationWithRoles(org.id);
    }
    async getOrganizationMembers(id, user) {
        // Check user has access to this organization
        const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, id);
        if (!userRole) {
            throw new common_1.ForbiddenException('You do not have access to this organization');
        }
        return this.organizationsService.getOrganizationMembers(id);
    }
    async updateMemberRole(organizationId, userId, body, user) {
        // Check user's role in this organization
        const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, organizationId);
        if (!userRole) {
            throw new common_1.ForbiddenException('You do not have access to this organization');
        }
        if (userRole !== data_1.Role.OWNER && userRole !== data_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only owners and admins can update member roles');
        }
        // Prevent users from changing their own role (security measure)
        if (userId === user.userId) {
            throw new common_1.ForbiddenException('You cannot change your own role');
        }
        await this.organizationsService.updateUserRoleInOrganization(organizationId, userId, body.role);
        // Return updated members list
        return this.organizationsService.getOrganizationMembers(organizationId);
    }
    async removeMember(organizationId, userId, user) {
        // Check user's role in this organization
        const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, organizationId);
        if (!userRole) {
            throw new common_1.ForbiddenException('You do not have access to this organization');
        }
        if (userRole !== data_1.Role.OWNER && userRole !== data_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only owners and admins can remove members');
        }
        // Prevent users from removing themselves
        if (userId === user.userId) {
            throw new common_1.ForbiddenException('You cannot remove yourself from the organization');
        }
        await this.organizationsService.removeUserFromOrganization(organizationId, userId);
        // Return updated members list
        return this.organizationsService.getOrganizationMembers(organizationId);
    }
    async addMember(organizationId, body, user) {
        // Check user's role in this organization
        const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, organizationId);
        if (!userRole) {
            throw new common_1.ForbiddenException('You do not have access to this organization');
        }
        if (userRole !== data_1.Role.OWNER && userRole !== data_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only owners and admins can add members');
        }
        // Find user by email
        const targetUser = await this.usersService.findByEmail(body.email);
        if (!targetUser) {
            throw new common_1.ForbiddenException('User with this email does not exist');
        }
        // Add user to organization
        await this.organizationsService.addUserToOrganization(targetUser.id, organizationId, body.role);
        // Return updated members list
        return this.organizationsService.getOrganizationMembers(organizationId);
    }
    async updateOrganization(id, body, user) {
        // Check user's role in this organization
        const userRole = await this.organizationsService.getUserRoleInOrganization(user.userId, id);
        if (!userRole) {
            throw new common_1.ForbiddenException('You do not have access to this organization');
        }
        if (userRole !== data_1.Role.OWNER && userRole !== data_1.Role.ADMIN) {
            throw new common_1.ForbiddenException('Only owners and admins can update organization name');
        }
        const updatedOrg = await this.organizationsService.update(id, body.name);
        // Return organization with roles
        return this.organizationsService.getOrganizationWithRoles(updatedOrg.id);
    }
};
exports.OrganizationsController = OrganizationsController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__param(0, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getUserOrganizations", null);
tslib_1.__decorate([
    (0, common_1.Post)(),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__param(1, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrganizationsController.prototype, "createOrganization", null);
tslib_1.__decorate([
    (0, common_1.Get)(':id/members'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrganizationsController.prototype, "getOrganizationMembers", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id/members/:userId/role'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Param)('userId')),
    tslib_1.__param(2, (0, common_1.Body)()),
    tslib_1.__param(3, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrganizationsController.prototype, "updateMemberRole", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id/members/:userId/remove'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Param)('userId')),
    tslib_1.__param(2, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, String, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrganizationsController.prototype, "removeMember", null);
tslib_1.__decorate([
    (0, common_1.Post)(':id/members'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrganizationsController.prototype, "addMember", null);
tslib_1.__decorate([
    (0, common_1.Patch)(':id'),
    tslib_1.__param(0, (0, common_1.Param)('id')),
    tslib_1.__param(1, (0, common_1.Body)()),
    tslib_1.__param(2, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [String, Object, Object]),
    tslib_1.__metadata("design:returntype", Promise)
], OrganizationsController.prototype, "updateOrganization", null);
exports.OrganizationsController = OrganizationsController = tslib_1.__decorate([
    (0, common_1.Controller)('organizations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof organizations_service_1.OrganizationsService !== "undefined" && organizations_service_1.OrganizationsService) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], OrganizationsController);


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(39);
const auth_controller_1 = __webpack_require__(41);
const users_module_1 = __webpack_require__(16);
const organizations_module_1 = __webpack_require__(36);
const jwt_1 = __webpack_require__(40);
const passport_1 = __webpack_require__(30);
const jwt_strategy_1 = __webpack_require__(42);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            organizations_module_1.OrganizationsModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'secretKey',
                signOptions: { expiresIn: '60m' },
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const users_service_1 = __webpack_require__(17);
const organizations_service_1 = __webpack_require__(9);
const jwt_1 = __webpack_require__(40);
const bcrypt = tslib_1.__importStar(__webpack_require__(18));
let AuthService = class AuthService {
    constructor(usersService, organizationsService, jwtService) {
        this.usersService = usersService;
        this.organizationsService = organizationsService;
        this.jwtService = jwtService;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findByEmail(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        // Get user's first organization (or we could let them select one)
        const organizations = await this.organizationsService.getUserOrganizations(user.id);
        const currentOrgId = organizations.length > 0 ? organizations[0].id : null;
        // Get user's role in the current organization
        const role = currentOrgId
            ? await this.organizationsService.getUserRoleInOrganization(user.id, currentOrgId)
            : null;
        const payload = {
            username: user.email,
            sub: user.id,
            role: role || 'VIEWER', // Default role if no org
            orgId: currentOrgId
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object, typeof (_b = typeof organizations_service_1.OrganizationsService !== "undefined" && organizations_service_1.OrganizationsService) === "function" ? _b : Object, typeof (_c = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _c : Object])
], AuthService);


/***/ }),
/* 40 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const auth_service_1 = __webpack_require__(39);
const users_service_1 = __webpack_require__(17);
const organizations_service_1 = __webpack_require__(9);
const create_user_dto_1 = __webpack_require__(20);
const jwt_auth_guard_1 = __webpack_require__(29);
const auth_1 = __webpack_require__(31);
const data_1 = __webpack_require__(14);
let AuthController = class AuthController {
    constructor(authService, usersService, organizationsService) {
        this.authService = authService;
        this.usersService = usersService;
        this.organizationsService = organizationsService;
    }
    async getCurrentUser(user) {
        // Get full user details from database
        const fullUser = await this.usersService.findOne(user.userId);
        if (!fullUser) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const { password, ...userWithoutPassword } = fullUser;
        return userWithoutPassword;
    }
    async checkEmailExists(body) {
        const user = await this.usersService.findByEmail(body.email);
        if (user) {
            return { message: 'Account exists', exists: true };
        }
        return { message: 'Email available', exists: false };
    }
    async login(body) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        return this.authService.login(user);
    }
    async register(createUserDto) {
        // Auto-create organization if not provided or doesn't exist
        let org;
        if (createUserDto.organizationId) {
            try {
                // Only try to find if it's a valid UUID format
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(createUserDto.organizationId)) {
                    org = await this.organizationsService.findOne(createUserDto.organizationId);
                }
            }
            catch (error) {
                // If lookup fails, we'll create a new org below
                org = null;
            }
        }
        if (!org) {
            // Create a new organization for this user
            // Get the count of existing organizations and create "Org x" where x is count + 1
            const orgCount = await this.organizationsService.getOrganizationCount();
            org = await this.organizationsService.create(`Org ${orgCount + 1}`);
        }
        // Remove organizationId from DTO
        const { organizationId, ...userData } = createUserDto;
        const user = await this.usersService.create(userData);
        // Add user to organization as OWNER
        await this.organizationsService.addUserToOrganization(user.id, org.id, data_1.Role.OWNER);
        return { message: 'Sign up successful! Check your email for a verification link!', user };
    }
};
exports.AuthController = AuthController;
tslib_1.__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    tslib_1.__param(0, (0, auth_1.CurrentUser)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
tslib_1.__decorate([
    (0, common_1.Post)('email-exists'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "checkEmailExists", null);
tslib_1.__decorate([
    (0, common_1.Post)('login'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
tslib_1.__decorate([
    (0, common_1.Post)('register'),
    tslib_1.__param(0, (0, common_1.Body)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof create_user_dto_1.CreateUserDto !== "undefined" && create_user_dto_1.CreateUserDto) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
exports.AuthController = AuthController = tslib_1.__decorate([
    (0, common_1.Controller)('auth'),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object, typeof (_c = typeof organizations_service_1.OrganizationsService !== "undefined" && organizations_service_1.OrganizationsService) === "function" ? _c : Object])
], AuthController);


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const tslib_1 = __webpack_require__(4);
const passport_jwt_1 = __webpack_require__(43);
const passport_1 = __webpack_require__(30);
const common_1 = __webpack_require__(1);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor() {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'secretKey',
        });
    }
    async validate(payload) {
        return { userId: payload.sub, username: payload.username, role: payload.role, organizationId: payload.orgId };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [])
], JwtStrategy);


/***/ }),
/* 43 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const app_module_1 = __webpack_require__(3);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 8080;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map