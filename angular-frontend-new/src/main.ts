import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

async function bootstrap(): Promise<void> {
  if (!environment.production) {
    await import('@angular/compiler');
  }

  await bootstrapApplication(AppComponent, appConfig);
}

bootstrap()
  .catch((err) => console.error(err));
