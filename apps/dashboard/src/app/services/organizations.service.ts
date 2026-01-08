import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization, Role } from '@task-manager/data';

export interface OrganizationMember {
  userId: string;
  role: Role;
  email: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationsService {
  private apiUrl = '/api/organizations';

  constructor(private http: HttpClient) {}

  getUserOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.apiUrl);
  }

  updateOrganization(id: string, name: string): Observable<Organization> {
    return this.http.patch<Organization>(`${this.apiUrl}/${id}`, { name });
  }

  createOrganization(name: string): Observable<Organization> {
    return this.http.post<Organization>(this.apiUrl, { name });
  }

  getOrganizationMembers(organizationId: string): Observable<OrganizationMember[]> {
    return this.http.get<OrganizationMember[]>(`${this.apiUrl}/${organizationId}/members`);
  }

  updateMemberRole(organizationId: string, userId: string, role: Role): Observable<OrganizationMember[]> {
    return this.http.patch<OrganizationMember[]>(`${this.apiUrl}/${organizationId}/members/${userId}/role`, { role });
  }

  removeMember(organizationId: string, userId: string): Observable<OrganizationMember[]> {
    return this.http.patch<OrganizationMember[]>(`${this.apiUrl}/${organizationId}/members/${userId}/remove`, {});
  }

  addMember(organizationId: string, email: string, role: Role): Observable<OrganizationMember[]> {
    return this.http.post<OrganizationMember[]>(`${this.apiUrl}/${organizationId}/members`, { email, role });
  }
}

