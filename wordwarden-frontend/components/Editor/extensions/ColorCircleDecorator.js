import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin, PluginKey } from 'prosemirror-state';

const ColorCircleDecorator = Extension.create({
    name: 'colorCircleDecorator',

    addProseMirrorPlugins() {
        let pluginView = null;  // This will hold the reference to the view

        return [
            new Plugin({
                key: new PluginKey('colorCircleDecorator'),
                view(editorView) {
                    pluginView = editorView;  // Store the editor view in the plugin
                    return {
                        destroy() {
                            pluginView = null;
                        }
                    };
                },
                props: {
                    decorations(state) {
                        if (!pluginView) {
                            return DecorationSet.empty;
                        }
                        const decorations = [];
                        const textNodes = findTextNodesWithMarks(state.doc, 'assistantMark');

                        textNodes.forEach(({ node, pos }) => {
                            node.marks.forEach(mark => {
                                if (mark.type.name === 'assistantMark' && mark.attrs.color) {
                                    const assistants = mark.attrs.classNames.split(' ').filter((item) => item !== "focus")
                                    for (let i = 2; i >= 0; i--) {
                                        if (assistants[i]) {
                                            const assistant = assistants[i]
                                            const widget = Decoration.widget(pos, createColorCircle(assistant, pos, pluginView, (12 * i)), { side: 1 });
                                            decorations.push(widget);
                                        }
                                    }
                                    if (assistants.length > 3) {
                                        const counter = `+${assistants.length - 3}`
                                        const widget = Decoration.widget(pos, createCounter(pos, pluginView, counter), { side: 1 });
                                        decorations.push(widget);
                                    }
                                }
                            });
                        });

                        return DecorationSet.create(state.doc, decorations);
                    }
                }
            })
        ];
    }
});

function createColorCircle(assistant, pos, view, offset) {
    const circle = document.createElement('div');
    circle.style.marginTop = '7px';
    circle.style.width = '17px';
    circle.style.height = '17px';
    circle.style.border = '1px solid white'
    circle.style.borderRadius = '50%';
    circle.style.backgroundImage = `url(../../assistants_icons/${assistant}.png)`;
    circle.style.backgroundPosition = 'center';
    circle.style.backgroundSize = '16px 16px'
    circle.style.position = 'absolute';
    circle.style.left = `-${30 + offset}px`;
    circle.style.cursor = 'default';
    circle.className = 'color-circle';
    return circle;
}

function createCounter(pos, view, content) {
    const counter = document.createElement('div');
    counter.innerHTML = content;
    counter.style.marginTop = '5px';
    counter.style.fontSize = '12px';
    counter.style.textAlign = 'end';
    counter.style.height = '20px';
    counter.style.position = 'absolute';
    counter.style.left = `-70px`;
    counter.className = 'counter';
    return counter;
}

function findTextNodesWithMarks(doc, markType) {
    const nodes = [];
    doc.descendants((node, pos) => {
        if (node.isText && node.marks.some(mark => mark.type.name === markType)) {
            nodes.push({ node, pos });
        }
    });
    return nodes;
}

export { ColorCircleDecorator };
