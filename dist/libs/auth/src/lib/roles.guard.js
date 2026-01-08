"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const data_1 = require("@task-manager/data");
const roles_decorator_1 = require("./roles.decorator");
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
    tslib_1.__metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map