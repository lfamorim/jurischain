import humanInterval from 'human-interval'

import { createDriver, latestChrome, latestFirefox, latestSafari } from './create-driver'
import { initServer } from './server'

const THIRTY_MINUTES = humanInterval('30 minutes') as number
jest.setTimeout(THIRTY_MINUTES)

describe('saucelabs tests', () => {
  it('should call \'jurischain\' event', async () => {
    const baseUrl = await initServer()
    const driver = await createDriver(undefined, undefined, latestChrome)

    try {
      await driver.manage().window().maximize()
      await driver.get(baseUrl)

      await driver.wait(async (currentDriver) => {
        const element = await currentDriver.findElement({ className: 'jurischain-captcha__text' })
        const text = await element.getText()

        if (text === 'Seu acesso foi validado com sucesso.') {
          expect(text).toBe('Seu acesso foi validado com sucesso.')
          return element
        }
        return undefined
      })
    } finally {
      await driver.quit()
    }
  })
})
