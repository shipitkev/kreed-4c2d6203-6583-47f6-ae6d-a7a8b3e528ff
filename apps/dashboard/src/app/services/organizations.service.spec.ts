import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrganizationsService, OrganizationMember } from './organizations.service';
import { Organization, Role } from '@task-manager/data';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrganizationsService],
    });
    service = TestBed.inject(OrganizationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserOrganizations', () => {
    it('should fetch all user organizations', () => {
      const mockOrganizations: Organization[] = [
        {
          id: 'org-1',
          name: 'Organization 1',
          roles: { 'user-1': Role.OWNER },
        },
        {
          id: 'org-2',
          name: 'Organization 2',
          roles: { 'user-1': Role.ADMIN },
        },
      ];

      service.getUserOrganizations().subscribe((orgs) => {
        expect(orgs.length).toBe(2);
        expect(orgs[0].name).toBe('Organization 1');
        expect(orgs[1].roles['user-1']).toBe(Role.ADMIN);
      });

      const req = httpMock.expectOne('/api/organizations');
      expect(req.request.method).toBe('GET');
      req.flush(mockOrganizations);
    });

    it('should return empty array when user has no organizations', () => {
      service.getUserOrganizations().subscribe((orgs) => {
        expect(orgs).toEqual([]);
      });

      const req = httpMock.expectOne('/api/organizations');
      req.flush([]);
    });
  });

  describe('createOrganization', () => {
    it('should create a new organization', () => {
      const name = 'New Organization';
      const mockOrg: Organization = {
        id: 'org-new',
        name,
        roles: { 'user-1': Role.OWNER },
      };

      service.createOrganization(name).subscribe((org) => {
        expect(org.name).toBe(name);
        expect(org.id).toBe('org-new');
      });

      const req = httpMock.expectOne('/api/organizations');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name });
      req.flush(mockOrg);
    });
  });

  describe('updateOrganization', () => {
    it('should update organization name', () => {
      const id = 'org-1';
      const newName = 'Updated Name';
      const updatedOrg: Organization = {
        id,
        name: newName,
        roles: { 'user-1': Role.OWNER },
      };

      service.updateOrganization(id, newName).subscribe((org) => {
        expect(org.name).toBe(newName);
      });

      const req = httpMock.expectOne(`/api/organizations/${id}`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ name: newName });
      req.flush(updatedOrg);
    });
  });

  describe('getOrganizationMembers', () => {
    it('should fetch organization members', () => {
      const orgId = 'org-1';
      const mockMembers: OrganizationMember[] = [
        {
          userId: 'user-1',
          email: 'user1@example.com',
          role: Role.OWNER,
        },
        {
          userId: 'user-2',
          email: 'user2@example.com',
          role: Role.ADMIN,
        },
      ];

      service.getOrganizationMembers(orgId).subscribe((members) => {
        expect(members.length).toBe(2);
        expect(members[0].role).toBe(Role.OWNER);
        expect(members[1].email).toBe('user2@example.com');
      });

      const req = httpMock.expectOne(`/api/organizations/${orgId}/members`);
      expect(req.request.method).toBe('GET');
      req.flush(mockMembers);
    });
  });

  describe('addMember', () => {
    it('should add a member to organization', () => {
      const orgId = 'org-1';
      const email = 'newuser@example.com';
      const role = Role.VIEWER;
      const mockMembers: OrganizationMember[] = [
        {
          userId: 'user-1',
          email: 'user1@example.com',
          role: Role.OWNER,
        },
        {
          userId: 'user-new',
          email,
          role,
        },
      ];

      service.addMember(orgId, email, role).subscribe((members) => {
        expect(members.length).toBe(2);
        expect(members[1].email).toBe(email);
        expect(members[1].role).toBe(role);
      });

      const req = httpMock.expectOne(`/api/organizations/${orgId}/members`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, role });
      req.flush(mockMembers);
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role', () => {
      const orgId = 'org-1';
      const userId = 'user-2';
      const newRole = Role.ADMIN;
      const mockMembers: OrganizationMember[] = [
        {
          userId: 'user-1',
          email: 'user1@example.com',
          role: Role.OWNER,
        },
        {
          userId: 'user-2',
          email: 'user2@example.com',
          role: newRole,
        },
      ];

      service.updateMemberRole(orgId, userId, newRole).subscribe((members) => {
        const updatedMember = members.find((m) => m.userId === userId);
        expect(updatedMember?.role).toBe(newRole);
      });

      const req = httpMock.expectOne(`/api/organizations/${orgId}/members/${userId}/role`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ role: newRole });
      req.flush(mockMembers);
    });
  });

  describe('removeMember', () => {
    it('should remove a member from organization', () => {
      const orgId = 'org-1';
      const userId = 'user-2';
      const mockMembers: OrganizationMember[] = [
        {
          userId: 'user-1',
          email: 'user1@example.com',
          role: Role.OWNER,
        },
      ];

      service.removeMember(orgId, userId).subscribe((members) => {
        expect(members.length).toBe(1);
        expect(members.find((m) => m.userId === userId)).toBeUndefined();
      });

      const req = httpMock.expectOne(`/api/organizations/${orgId}/members/${userId}/remove`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockMembers);
    });
  });
});

