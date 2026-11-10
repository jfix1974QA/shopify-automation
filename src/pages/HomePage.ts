import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  open() {
    return this.goto('/');
  }

  logo() {
    return this.find('store logo or name in the header', ['.header__heading-link', 'header a[href="/"]', 'header .logo']);
  }

  navLinks() {
    return this.page.locator('header nav a[href], .header__inline-menu a[href]');
  }

  footer() {
    return this.page.locator('footer').first();
  }
}
