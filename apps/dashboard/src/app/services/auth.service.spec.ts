import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthResponse, User } from '@task-manager/data';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('checkEmailExists', () => {
    it('should check if email exists', () => {
      const email = 'test@example.com';
      const mockResponse = { message: 'Email check complete', exists: true };

      service.checkEmailExists(email).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.exists).toBe(true);
      });

      const req = httpMock.expectOne('/api/auth/email-exists');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email });
      req.flush(mockResponse);
    });

    it('should return false when email does not exist', () => {
      const email = 'new@example.com';
      const mockResponse = { message: 'Email check complete', exists: false };

      service.checkEmailExists(email).subscribe((response) => {
        expect(response.exists).toBe(false);
      });

      const req = httpMock.expectOne('/api/auth/email-exists');
      req.flush(mockResponse);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse: AuthResponse = {
        access_token: 'mock-jwt-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
      };

      service.login(credentials).subscribe((response) => {
        expect(response.access_token).toBe('mock-jwt-token');
        expect(response.user.email).toBe('test@example.com');
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should register a new user', () => {
      const payload = {
        email: 'new@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };
      const mockResponse = { message: 'User registered successfully' };

      service.register(payload).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user', () => {
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
      };

      service.getCurrentUser().subscribe((user) => {
        expect(user).toEqual(mockUser);
        expect(user.email).toBe('test@example.com');
      });

      const req = httpMock.expectOne('/api/auth/me');
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });
});

