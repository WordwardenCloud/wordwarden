import { Mark, mergeAttributes } from '@tiptap/core';

export const AssistantMark = Mark.create({
  name: 'assistantMark',

  addAttributes() {
    return {
      propositions: {
        default: null,
        parseHTML: element => element.getAttribute('propositions'),
        renderHTML: attributes => {
          if (!attributes.propositions) {
            return {}
          }

          return { propositions: attributes.propositions };
        },
      },
      classNames: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.classNames) {
            return {}
          }

          return { class: attributes.classNames }
        }
      },
      color: {
        default: null,
        parseHTML: element => element.getAttribute('data-color'),
        renderHTML: attributes => {
          if (!attributes.color) {
            return {}
          }

          let style
          const padding = '1.4px 0'
          const margin = '2.2px 0'
          
          !attributes.classNames.includes("focus") ?
            style = `padding: ${padding}; margin: ${margin}; background-color: ${attributes.color.replace(')', 'Hl)')}; color: inherit; border-radius: 0.5px; cursor: pointer;`
            :
            style = `padding: ${padding}; margin: ${margin}; background-color: ${attributes.color.replace(')', 'Hl)')}; color: inherit; border-radius: 0.5px; border-bottom: ${`2px solid ${attributes.color}`}; cursor: pointer;` // ${attributes.color.replace(')', 'Ul)')}

          return {
            'data-color': attributes.color,
            style: style,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[propositions][class][data-color]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    let props = {};
    if (HTMLAttributes.propositions) {
      try {
        props = JSON.parse(HTMLAttributes.propositions);
      } catch (e) {
        console.error("Error parsing propositions attribute:", e);
      }
    }

    const dynamicAttributes = {};
    Object.keys(props).forEach(key => {
      dynamicAttributes[key] = props[key];
    });

    return ['span', mergeAttributes(dynamicAttributes, {class: HTMLAttributes.class}, {style: HTMLAttributes.style}), 0];
  },

  addCommands() {
    return {
      setAssistantMark: attributes => ({ commands }) => {
        return commands.setMark(this.name, attributes)
      },
      unsetAssistantMark: () => ({ commands }) => {
        return commands.unsetMark(this.name)
      },
    }
  },

});