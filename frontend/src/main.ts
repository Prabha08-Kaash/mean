// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter} from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, } from '@angular/common/http';
import { RouterModule } from '@angular/router';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes,),

    // 👇 Add this to configure router behavior globally
    { 
      provide: 'ROUTER_CONFIGURATION',
      useValue: { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }
    },

    provideHttpClient()
  ]
}).catch(err => console.error(err));
