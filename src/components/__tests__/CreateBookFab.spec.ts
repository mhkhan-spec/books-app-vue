import { describe, it, expect } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import CreateBookFab from '../CreateBookFab.vue';

describe('CreateBookFab.vue', () => {
    // Positive Tests
    it('renders a router-link with the correct destination', () => {
        // ARRANGE
        const wrapper = mount(CreateBookFab, {
            global: {
                stubs: {
                    RouterLink: RouterLinkStub
                }
            }
        });

        // ASSERT
        const link = wrapper.findComponent(RouterLinkStub);
        expect(link.exists()).toBe(true);
        expect(link.props('to')).toBe('/create');
    });

    it('has the correct aria-label and contains an SVG icon', () => {
        // ARRANGE
        const wrapper = mount(CreateBookFab, {
            global: {
                stubs: {
                    RouterLink: RouterLinkStub
                }
            }
        });

        // ASSERT
        const link = wrapper.findComponent(RouterLinkStub);
        expect(link.attributes('aria-label')).toBe('Add Book');
        expect(wrapper.find('svg').exists()).toBe(true);
    });

    // Negative Tests
    it('is hidden on small screens by default', () => {
        // ARRANGE
        const wrapper = mount(CreateBookFab, {
            global: {
                stubs: {
                    RouterLink: RouterLinkStub
                }
            }
        });

        // ASSERT
        const link = wrapper.findComponent(RouterLinkStub);
        expect(link.classes()).toContain('hidden');
        expect(link.classes()).toContain('md:flex');
    });

    it('does not contain any unexpected text content', () => {
        // ARRANGE
        const wrapper = mount(CreateBookFab, {
            global: {
                stubs: {
                    RouterLink: RouterLinkStub
                }
            }
        });

        // ASSERT
        // Should only contain the SVG (which has no visible text)
        expect(wrapper.text().trim()).toBe('');
    });
});
