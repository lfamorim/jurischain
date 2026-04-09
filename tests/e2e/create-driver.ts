import { Builder, Capabilities } from 'selenium-webdriver'

const tags = ['jurischain']

export interface BuilderConfiguration {
  readonly browserName: string
  readonly browserVersion: string
  readonly platformName: string
  readonly screenWidth: number
  readonly screenHeight: number
  readonly screenshotHeight: number
  readonly screenshotWidth: number
}

export const latestChrome: BuilderConfiguration = {
  browserName: 'chrome',
  browserVersion: 'latest',
  platformName: 'Windows 10',
  screenWidth: 1280,
  screenHeight: 960,
  screenshotWidth: 1264,
  screenshotHeight: 828,
}

export const latestFirefox: BuilderConfiguration = {
  browserName: 'firefox',
  browserVersion: 'latest',
  platformName: 'Windows 10',
  screenWidth: 1280,
  screenHeight: 960,
  screenshotWidth: 1268,
  screenshotHeight: 879,
}

export const latestSafari: BuilderConfiguration = {
  browserName: 'safari',
  browserVersion: 'latest',
  platformName: 'macOS 13',
  screenWidth: 1280,
  screenHeight: 960,
  screenshotWidth: 1280,
  screenshotHeight: 922,
}

export async function createDriver(
  withCapabilities: Record<string, unknown> | Capabilities = {},
  envName?: string,
  config: BuilderConfiguration = latestChrome,
) {
  const { browserName, browserVersion, platformName, screenWidth, screenHeight } = config

  if (!process.env.SAUCELABS_USERNAME || !process.env.SAUCELABS_ACCESSKEY) {
    throw new Error('SAUCELABS_USERNAME and SAUCELABS_ACCESSKEY environment variables are required')
  }

  return new Builder()
    .withCapabilities({
      browserName,
      browserVersion,
      platformName,
      ...withCapabilities,
      'sauce:options': {
        username: process.env.SAUCELABS_USERNAME,
        accessKey: process.env.SAUCELABS_ACCESSKEY,
        build: 'Jurischain',
        name: envName,
        maxDuration: 3600,
        idleTimeout: 1000,
        tags,
        screenResolution: `${screenWidth}x${screenHeight}`,
      },
    })
    .usingServer('https://ondemand.saucelabs.com/wd/hub')
    .build()
}
