import React, { useCallback, useState } from 'react'
import { AdManagerSlot } from './AdManagerSlot'
import { AdManagerProvider } from '../Context/AdManagerProvider'
import GPT from 'gpt-mock'

import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'

jest.useFakeTimers()

const mockScripts = () => {
  window.Yieldbird = {
    cmd: [],
    setGPTTargeting: () => {},
    refresh: (_slots) => {}
  }

  window.googletag = new GPT()
}

const TestComponent = () => {
  const [toggle, setToggle] = useState<boolean>(true)
  const buttonHandler = useCallback(() => {
    setToggle(!toggle)
  }, [toggle, setToggle])

  return (
    <AdManagerProvider uuid='a81dc6d2-be53-4481-9012-812bbbec9109'>
      <div>
        <div>
          AD 1
          {toggle && (
            <AdManagerSlot
              adUnitPath='52555387/dazzling.news_160x600'
              size={[
                [120, 600],
                [160, 600]
              ]}
              optDiv='paralos-300x250_mobile'
            />
          )}
        </div>
        <button onClick={buttonHandler}>Toggle ads</button>
      </div>
    </AdManagerProvider>
  )
}

describe('AdManagerSlot', () => {
  beforeEach(() => {
    mockScripts()

    spyOn(googletag, 'enableServices')
    spyOn(googletag, 'defineSlot').and.callThrough()
    spyOn(googletag, 'display')
    spyOn(googletag, 'destroySlots').and.callThrough()
    spyOn(window.Yieldbird, 'setGPTTargeting')
    spyOn(window.Yieldbird, 'refresh')
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
  })

  it('renders slot properly', async () => {
    const wrapper = mount(
      <AdManagerProvider uuid='bar'>
        <AdManagerSlot adUnitPath='/foo' size={[200, 300]} optDiv='foo' />
      </AdManagerProvider>
    )

    await act(async () => {
      wrapper.update()
    })

    expect(wrapper.find('#foo')).toBeTruthy()
    expect(window.googletag.cmd).toHaveLength(1)
    expect(window.Yieldbird.cmd).toHaveLength(1)
  })

  it('runs proper GPT & Yieldbird commands', async () => {
    const wrapper = mount(<TestComponent />)

    await act(async () => {
      wrapper.update()
    })

    // disable initial load command
    window.googletag.cmd[0]()

    // create slot commands
    window.Yieldbird.cmd[0]()
    window.googletag.cmd[1]()

    expect(window.googletag.enableServices).toHaveBeenCalledTimes(1)
    expect(window.googletag.defineSlot).toHaveBeenCalledTimes(1)
    expect(window.googletag.display).toHaveBeenCalledTimes(1)
    expect(window.Yieldbird.setGPTTargeting).toHaveBeenCalledTimes(1)

    expect(window.Yieldbird.cmd).toHaveLength(1)
    expect(window.googletag.cmd).toHaveLength(2)
    await wrapper.find('button').simulate('click')

    expect(window.googletag.cmd).toHaveLength(3)
    // destroy slot command
    window.googletag.cmd[2]()

    expect(window.googletag.destroySlots).toHaveBeenCalledTimes(1)
    await wrapper.find('button').simulate('click')

    // create slot command again
    expect(window.Yieldbird.cmd).toHaveLength(2)
    window.Yieldbird.cmd[1]()
    window.googletag.cmd[3]()

    expect(window.googletag.enableServices).toHaveBeenCalledTimes(2)
    expect(window.googletag.defineSlot).toHaveBeenCalledTimes(2)
    expect(window.googletag.display).toHaveBeenCalledTimes(2)
    expect(window.Yieldbird.setGPTTargeting).toHaveBeenCalledTimes(1)

    await jest.advanceTimersByTime(5000)
    jest.runAllTimers()

    expect(window.Yieldbird.cmd).toHaveLength(3)
    window.Yieldbird.cmd[2]()
    expect(window.Yieldbird.refresh).toHaveBeenCalledTimes(1)
  })
})
