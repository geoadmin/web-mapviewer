import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import LangSwitchButton from "@/modules/i18n/components/LangSwitchButton";

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const lang = 'fr'
    const wrapper = shallowMount(LangSwitchButton, {
      propsData: {
        lang,
        onClick: () => {},
        isActive: true
      }
    })
    expect(wrapper.text()).to.include(lang.toUpperCase())
  })
})
