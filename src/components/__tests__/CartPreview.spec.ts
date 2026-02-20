import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import CartPreview from '../CartPreview.vue';

describe('CartPreview.vue', () => {
    let store: any;
    let actions: any;
    let getters: any;

    const createMockStore = (items: any[] = [], totalPrice: number = 0, stockValue: number = 10) => {
        actions = {
            updateQuantity: vi.fn(),
            removeFromCart: vi.fn(),
        };
        getters = {
            cartItems: () => items,
            totalPrice: () => totalPrice,
            getBookStock: () => (id: number) => stockValue,
        };
        return createStore({
            actions,
            getters,
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    // --- Positive Tests ---

    it('renders "Your cart is empty" when there are no items', () => {
        store = createMockStore([]);
        const wrapper = mount(CartPreview, {
            global: {
                plugins: [store],
                stubs: { 'router-link': true }
            }
        });

        expect(wrapper.text()).toContain('Your cart is empty');
        expect(wrapper.find('router-link-stub').exists()).toBe(true);
    });

    it('renders cart items with correct details', () => {
        const items = [
            { id: 1, title: 'Book 1', price: '$10', quantity: 2, cover: 'img1.jpg', author: 'Author 1' }
        ];
        store = createMockStore(items, 20);
        const wrapper = mount(CartPreview, {
            global: {
                plugins: [store],
                stubs: { 'router-link': true }
            }
        });

        expect(wrapper.text()).toContain('Book 1');
        expect(wrapper.text()).toContain('$10');
        expect(wrapper.text()).toContain('2');
        expect(wrapper.text()).toContain('Subtotal');
        expect(wrapper.text()).toContain('$20');
    });

    it('dispatches updateQuantity action when increase button is clicked', async () => {
        const items = [
            { id: 1, title: 'Book 1', price: '$10', quantity: 2, cover: 'img1.jpg', author: 'Author 1' }
        ];
        store = createMockStore(items, 20);
        const wrapper = mount(CartPreview, {
            global: {
                plugins: [store],
                stubs: { 'router-link': true }
            }
        });

        const increaseBtn = wrapper.findAll('button').find(b => b.html().includes('M12 4.5v15m7.5-7.5h-15'));
        await increaseBtn?.trigger('click');

        expect(actions.updateQuantity).toHaveBeenCalledWith(expect.anything(), {
            bookId: 1,
            quantity: 3
        });
    });

    it('dispatches removeFromCart action when remove button is clicked', async () => {
        const items = [
            { id: 1, title: 'Book 1', price: '$10', quantity: 2, cover: 'img1.jpg', author: 'Author 1' }
        ];
        store = createMockStore(items, 20);
        const wrapper = mount(CartPreview, {
            global: {
                plugins: [store],
                stubs: { 'router-link': true }
            }
        });

        const removeBtn = wrapper.find('button.text-gray-400.hover\\:text-red-500');
        await removeBtn.trigger('click');

        expect(actions.removeFromCart).toHaveBeenCalledWith(expect.anything(), 1);
    });

    // --- Negative Tests ---

    it('disables decrease button when quantity is 1', () => {
        const items = [
            { id: 1, title: 'Book 1', price: '$10', quantity: 1, cover: 'img1.jpg', author: 'Author 1' }
        ];
        store = createMockStore(items, 10);
        const wrapper = mount(CartPreview, {
            global: {
                plugins: [store],
                stubs: { 'router-link': true }
            }
        });

        const decreaseBtn = wrapper.findAll('button').find(b => b.html().includes('M19.5 12h-15'));
        expect(decreaseBtn?.attributes('disabled')).toBeDefined();
    });

    it('disables increase button when stock is 0', () => {
        const items = [
            { id: 1, title: 'Book 1', price: '$10', quantity: 2, cover: 'img1.jpg', author: 'Author 1' }
        ];
        // Pass 0 as stockValue
        store = createMockStore(items, 20, 0);

        const wrapper = mount(CartPreview, {
            global: {
                plugins: [store],
                stubs: { 'router-link': true }
            }
        });

        const increaseBtn = wrapper.findAll('button').find(b => b.html().includes('M12 4.5v15m7.5-7.5h-15'));
        expect(increaseBtn?.attributes('disabled')).toBeDefined();
    });

    it('disables buttons when isUpdating is true', async () => {
        const items = [
            { id: 1, title: 'Book 1', price: '$10', quantity: 2, cover: 'img1.jpg', author: 'Author 1' }
        ];
        store = createMockStore(items, 20);
        const wrapper = mount(CartPreview, {
            global: {
                plugins: [store],
                stubs: { 'router-link': true }
            }
        });

        // Manually set isUpdating to true
        (wrapper.vm as any).isUpdating = true;
        await wrapper.vm.$nextTick();

        const buttons = wrapper.findAll('button');
        buttons.forEach(btn => {
            // Check if it's one of the action buttons (remove, decrease, increase)
            if (btn.attributes('disabled') !== undefined || btn.classes().includes('disabled:opacity-50')) {
                expect(btn.attributes('disabled')).toBeDefined();
            }
        });
    });

    it('shows alert when increasing quantity with no stock', async () => {
        const items = [
            { id: 1, title: 'Book 1', price: '$10', quantity: 2, cover: 'img1.jpg', author: 'Author 1', stock: 0 }
        ];
        // Pass 0 as stockValue
        store = createMockStore(items, 20, 0);

        const wrapper = mount(CartPreview, {
            global: {
                plugins: [store],
                stubs: { 'router-link': true }
            }
        });

        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        // Directly call increaseQuantity to bypass button disabled state if needed, 
        // or trigger if we can ensure it's clickable
        await (wrapper.vm as any).increaseQuantity(items[0]);

        expect(alertSpy).toHaveBeenCalledWith('No more stock available.');
        alertSpy.mockRestore();
    });
});
