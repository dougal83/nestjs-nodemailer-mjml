<h1 align="center">
  <br>
  Nestjs-nodemailer-mjml
  <br>
</h1>

<h4 align="center">
<b>nestjs-nodemailer-mjml</b> is a wrapper to encapsulate the functionality of <a href="https://www.npmjs.com/package/nodemailer-mjml"><b>nodemailer-mjml</b></a> in a reusable <a href="https://nestjs.com/"><b>NestJS</b></a> module.

</h4>
  
<p align="center">
  <a href="https://github.com/dougal83/nestjs-nodemailer-mjml/actions/workflows/ci.yml"><img src="https://github.com/dougal83/nestjs-nodemailer-mjml/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/dougal83/nestjs-nodemailer-mjml/actions/workflows/publish.yml"><img src="https://github.com/dougal83/nestjs-nodemailer-mjml/actions/workflows/publish.yml/badge.svg"></a>
  <a href="https://badge.fury.io/js/nestjs-nodemailer-mjml"><img src="https://badge.fury.io/js/nestjs-nodemailer-mjml.svg" alt="npm version"></a>
</p>
---

## Installation

```sh
npm install nestjs-nodemailer-mjml
# or using yarn add nestjs-nodemailer-mjml
```

## Configuration

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from 'nestjs-nodemailer-mjml';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: 'smtps://username:password@smtp.example.com',
      mjmlPluginOptions: {
        templateFolder: join(__dirname, 'assets/emailTemplates'),
      },
      defaults: {
        from: '"John Smith" <john.smith@example.com>',
        templateData: {
          applicationName: 'Example App',
          copyright: `Acme Co, ${new Date().getFullYear()}`,
        },
      },
    }),
  ],
})
export class AppModule {}
```

> [!TIP]
> You can configure `transport`, `mjmlPluginOptions` and provide your own `defaults`.
> For configuration of `transport` and `mjmlPluginOptions` please refer to [Nodemailer](https://www.nodemailer.com/smtp/) and [Nodemailer-mjml](https://www.npmjs.com/package/nodemailer-mjml) documentation repectively. The `defaults` property allows you to provide default options and template variables.

### Async Configuration

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from 'nestjs-nodemailer-mjml';
import { join } from 'path';
import mailerConfig from './mailer.config';

@Module({
  imports: [
    ConfigModule.forFeature(mailerConfig),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        transport: configService.get('mailer.transport'),
        mjmlPluginOptions: {
          templateFolder: join(
            __dirname,
            configService.get('mailer.templateFolder')
          ),
        },
        defaults: {
          from: '"John Smith" <john.smith@example.com>',
          templateData: {
            applicationName: 'Example App',
            copyright: `Acme Co, ${new Date().getFullYear()}`,
          },
        },
      }),
    }),
  ],
  inject: [ConfigService],
})
export class AppModule {}
```

> [!TIP]
> For more information on use of `@nestjs/config`, please refer to [NestJS config documentation](https://docs.nestjs.com/techniques/configuration).

### Example Usage

```ts
import { Injectable } from '@nestjs/common';
import { MailerModule } from 'nestjs-nodemailer-mjml';

@Injectable()
export class ExampleService {
  constructor(private readonly mailerService: MailerService) {}

  async sendExample() {
    this.mailerService.sendMail({
      to: 'joe.bloggs@example.com',
      subject: 'Testing nestjs-nodemailer-mjml',
      templateName: 'mytemplate',
      templateData: {
        applicationName: 'Overridden Name',
        emailTitle: 'My Email Title',
        someText: 'Lorem ipsum dolor sit amet, consectetur...',
      },
    });
  }
}
```

> [!NOTE]
> Options provided to `sendMail()` override defaults provided at configuration. The `templateData.applicationName` property demonstrates an overridden value in the example context.

This example assumes that a template file called `mytemplate.mjml` exists in the configured `templateFolder`. Please ensure that your build process is deploying the assets as desired.

### Useful Resources

- [MJML](https://mjml.io/) - MJML framework documentation
- [Easy Email Pro](https://demo.easyemail.pro/full?utm_source=website) - Demo editor
