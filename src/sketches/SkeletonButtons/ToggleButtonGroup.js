class  ToggleButtonGroup{
    constructor(buttons) {
        this.buttons = buttons;
    }

    toggle(button) {
        this.buttons.forEach(b => b.isToggled = false);
        button.isToggled = true;
    }
} export default ToggleButtonGroup;