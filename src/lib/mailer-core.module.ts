import {
  DynamicModule,
  Global,
  Module,
  Provider,
  Type,
  ValueProvider,
} from '@nestjs/common';
import {
  MailerModuleAsyncOptions,
  MailerModuleOptions,
  MailerOptionsFactory,
} from './mailer-options.interface';
import { MAILER_MODULE_OPTIONS } from './mailer.constants';
import { MailerService } from './mailer.service';

@Global()
@Module({})
export class MailerCoreModule {
  public static forRoot(options: MailerModuleOptions): DynamicModule {
    const MailerModuleOptions: ValueProvider<MailerModuleOptions> = {
      provide: MAILER_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: MailerCoreModule,
      providers: [MailerModuleOptions, MailerService],
      exports: [MailerService],
    };
  }

  public static forRootAsync(options: MailerModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: MailerCoreModule,
      providers: [
        ...asyncProviders,
        MailerService,
        ...(options.extraProviders || []),
      ],
      imports: options.imports,
      exports: [MailerService],
    };
  }

  private static createAsyncProviders(
    options: MailerModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const useClass = options.useClass as Type<MailerOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: MailerModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MAILER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    // `as Type<MailerOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass || options.useExisting) as Type<MailerOptionsFactory>,
    ];
    return {
      provide: MAILER_MODULE_OPTIONS,
      useFactory: async (optionsFactory: MailerOptionsFactory) => {
        return optionsFactory.createMailerModuleOptions();
      },
      inject,
    };
  }
}
