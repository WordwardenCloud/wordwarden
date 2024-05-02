import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

export const HoverExtension = Extension.create({
  name: 'hoverExtension',

  addOptions: {
    onMouseOver: () => {},
    onMouseOut: () => {},
    onClick: () => {},
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('hover'),
        props: {
          handleDOMEvents: {
            mouseover: (view, event) => {
              this.options.onMouseOver(view, event);
              return false
            },
            mouseout: (view, event) => {
              this.options.onMouseOut(view, event);
              return false
            },
            click: (view, event) => {
              this.options.onClick(view, event);
              return false
            },
          }
        },
      }),
    ]
  },
});
