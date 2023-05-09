/* eslint-disable no-await-in-loop, no-restricted-syntax */
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import createPackageConfig from '../../configuration/rollup/create-package-config';
import locatePackage from './locate-package';
import compile from './compile';
import generateDts from './generate-dts';
import { Logger } from './Logger';
import { getPackageName } from './get-package-name';

const logger = new Logger('build-package');

export interface BuildOptions {
  analyze: boolean;
  sourcemap: boolean;
  minify: boolean;
  formats: string[];
}

export async function buildPackage(_packageName: string, options?: BuildOptions) {
  const packageName = getPackageName(_packageName);
  const packagePath = await locatePackage(packageName || '');

  if (!packagePath) {
    logger.error(`Package ${chalk.cyan(packageName)} does not exist`);
    process.exit(1);
  }

  logger.info(`Building package ${chalk.cyan(packageName)}`);

  try {
    const startTime = Date.now();
    await generateDts(packagePath);

    if (options?.formats) {
      for (const format of options.formats) {
        const config = await createPackageConfig({
          ...options,
          basePath: packagePath,
          format,
        });

        logger.info(`Building to ${chalk.cyan(format)} format...`);
        await compile(config);
      }
      if (fs.existsSync(path.join(packagePath, 'esm/index.css'))) {
        fs.copyFileSync(
          path.join(packagePath, 'esm/index.css'),
          path.join(packagePath, 'styles.css')
        );
      }
    }

    fs.copySync(
      path.join(packagePath, '/esm'),
      path.join(__dirname, '../../docs/node_modules', packageName, '/esm')
    );

    fs.copySync(
      path.join(packagePath, '/cjs'),
      path.join(__dirname, '../../docs/node_modules', packageName, '/cjs')
    );

    fs.copySync(
      path.join(packagePath, '/lib'),
      path.join(__dirname, '../../docs/node_modules', packageName, '/lib')
    );

    if (fs.existsSync(path.join(packagePath, '/styles.css'))) {
      fs.copySync(
        path.join(packagePath, '/styles.css'),
        path.join(__dirname, '../../docs/node_modules', packageName, 'styles.css')
      );
    }

    logger.info(
      `Package ${chalk.cyan(packageName)} was built in ${chalk.green(
        `${((Date.now() - startTime) / 1000).toFixed(2)}s`
      )}`
    );
  } catch (err: any) {
    logger.error(`Failed to compile package: ${chalk.cyan(packageName)}`);
    process.stdout.write(`${err.toString('minimal')}\n`);
    process.exit(1);
  }
}
