import { expect } from 'chai'
import { mount } from '@vue/test-utils'
import LangSwitchButton from '@/modules/i18n/components/LangSwitchButton'

// A small example of a unit test of a component in isolation
describe('LangSwitchButton.vue', () => {
  it('Show lang in upper case', () => {
    const lang = 'fr'
    const wrapper = mount(LangSwitchButton, {
      propsData: {
        lang,
        onClick: () => {},
        isActive: true,
      },
    })
    expect(wrapper.text()).to.include(lang.toUpperCase())
  })
})
