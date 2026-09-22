import { Component } from '@angular/core';
import { NotificationConfigComponent } from '../../../notification/component/notification-config/notification-config';
import { EmailConfigComponent } from '../../../email/component/email-config/email-config';
import { I18nPipe } from '../../../shared/i18n/i18n.pipe';

@Component({
  selector: 'app-settings',
  imports: [NotificationConfigComponent, EmailConfigComponent, I18nPipe],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class SettingsComponent {}

