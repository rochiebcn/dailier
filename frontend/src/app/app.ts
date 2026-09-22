import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { I18nPipe } from './shared/i18n/i18n.pipe';
import { I18nService, Language } from './shared/i18n/i18n.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, I18nPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = 'Dailier';
  protected readonly i18n = inject(I18nService);

  protected changeLanguage(language: Language): void {
    void this.i18n.setLanguage(language);
  }
}
