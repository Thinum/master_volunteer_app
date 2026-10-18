import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService, clearStoredAuthSession, setStoredAuthSession } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    clearStoredAuthSession();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => service.logout());

  it('emits token changes even when switching directly between logged-in accounts', () => {
    const tokens: (string | null)[] = [];
    const subscription = service.sessionToken$.subscribe(token => tokens.push(token));
    setStoredAuthSession('account-a', String(Date.now() + 60_000));
    setStoredAuthSession('account-b', String(Date.now() + 60_000));
    service.logout();
    expect(tokens).toEqual([null, 'account-a', 'account-b', null]);
    subscription.unsubscribe();
  });

  it('announces session invalidation from the HTTP interceptor immediately', () => {
    setStoredAuthSession('account-a', String(Date.now() + 60_000));
    let token: string | null = 'account-a';
    const subscription = service.sessionToken$.subscribe(value => token = value);
    clearStoredAuthSession('account-a');
    expect(token).toBeNull();
    subscription.unsubscribe();
  });

  it('ignores invalidation from an older account request', () => {
    setStoredAuthSession('account-b', String(Date.now() + 60_000));
    const tokens: (string | null)[] = [];
    const subscription = service.sessionToken$.subscribe(value => tokens.push(value));
    expect(clearStoredAuthSession('account-a')).toBeFalse();
    expect(tokens).toEqual(['account-b']);
    subscription.unsubscribe();
  });
});
