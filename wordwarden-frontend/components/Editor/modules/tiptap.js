// Get attributes from event.target
const getAllAttributes = (element, assistants) => {
  const attributes = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    if (assistants.includes(attr.name) || "excerpt".includes(attr.name)) attributes[attr.name] = attr.value;
  }
  return attributes;
};


const replaceText = (editor, excerpt, proposition) => {
  editor.state.doc.descendants((node, pos) => {
    if (node.isText && node.text.includes(excerpt)) {
      const startIndex = node.text.indexOf(excerpt) + pos;
      const endIndex = startIndex + excerpt.length;

      editor.chain().setTextSelection({ from: startIndex, to: endIndex })
        .unsetMark('assistantMark')
        .deleteSelection()
        .insertContent(proposition)
        .run();
      
    }
  })
};


const sortByExcerpt = (localModel, assistants) => {
  let localModelTmp = {};
  Object.entries(localModel)?.forEach(([assistant, content]) => {
    // Only if assistant is chosen
    if (assistants.includes(assistant)) {
      content.forEach(({excerpt, proposition}) => {
        if (!localModelTmp[excerpt]) {
          localModelTmp[excerpt] = {};
        }
        localModelTmp[excerpt][assistant] = proposition;
      })
    }
  })

  return localModelTmp
};


const setAllHighlights = (editor, assistants, localModel, threadDiv) => {
  // Sort by excerpt
  let localModelTmp = sortByExcerpt(localModel, assistants)

  // Set highlights
  Object.entries(localModelTmp).forEach(([excerpt, content]) => {
    const focused = threadDiv?.find((item) => (item.hover || item.clicked))?.excerpt === excerpt ? "focus" : ""
    setHighlightTextByExcerpt(editor, excerpt, content, focused)
  })
};


const setHighlightTextByExcerpt = (editor, excerpt, content, effectsClassnames = "") => {
  const contentCopy = content
  editor.state.doc.descendants((node, pos) => {
    if (node.isText && node.text.includes(excerpt)) {
      const startIndex = node.text.indexOf(excerpt) + pos;
      const endIndex = startIndex + excerpt.length;

      contentCopy["excerpt"] = excerpt
      const keys = Object.keys(contentCopy)
      const color = `var(--${keys[0]})`
      const classNames = (keys.reduce((acc, cur) => acc + " " + cur, "") + effectsClassnames).replace("excerpt", "").trim();
      editor.chain().setTextSelection({ from: startIndex, to: endIndex })
        .setMark('assistantMark', {classNames, propositions: (JSON.stringify(contentCopy)), color})
        .blur()
        .run();
    }
  });
};


const unsetAllHighlights = (editor) => {
  if (!editor || !editor.state) return;

  // Transaction for AssistantMark
  const trForAssistantMarks = editor.state.tr;
  let modifiedAssistantMarks = false;

  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return;

    const marks = node.marks.filter(mark => mark.type.name === 'assistantMark');
    if (marks.length > 0) {
      marks.forEach(mark => {
        const from = pos;
        const to = pos + node.nodeSize;
        trForAssistantMarks.removeMark(from, to, mark);
        modifiedAssistantMarks = true;
      });
    }
  });

  if (modifiedAssistantMarks) {
    editor.view.dispatch(trForAssistantMarks);
  }
};


export { getAllAttributes, replaceText, sortByExcerpt, unsetAllHighlights, setHighlightTextByExcerpt, setAllHighlights }