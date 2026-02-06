import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import Navbar from '../Navbar.vue'

describe('Navbar', () => {
    it('renders properly', () => {
        const wrapper = mount(Navbar, {
            global: {
                stubs: {
                    RouterLink: RouterLinkStub
                }
            }
        })
        expect(wrapper.exists()).toBe(true)
    })

    it('contains logo link to home', () => {
        const wrapper = mount(Navbar, {
            global: {
                stubs: {
                    RouterLink: RouterLinkStub
                }
            }
        })

        const links = wrapper.findAllComponents(RouterLinkStub)
        const homeLink = links.find(link => link.props().to === '/')
        expect(homeLink).toBeDefined()
        expect(homeLink!.text()).toContain('BookStore')
    })

    it('contains cart link to /cart with correct badge count', () => {
        const wrapper = mount(Navbar, {
            global: {
                stubs: {
                    RouterLink: RouterLinkStub
                }
            }
        })

        const links = wrapper.findAllComponents(RouterLinkStub)
        const cartLink = links.find(link => link.props().to === '/cart')
        expect(cartLink).toBeDefined()
        expect(cartLink!.text()).toContain('3')
    })
})
