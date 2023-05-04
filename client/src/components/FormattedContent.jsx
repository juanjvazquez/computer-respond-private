import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './App.css';

const FormattedContent = ({ content }) => {
  const lines = content.split('\n');
  const formattedContent = [];
  let inCodeBlock = false;
  let codeSnippet = '';

  const processText = (text, index) => {
    let formattedText = text.split(/((?:\*\*\*|\*\*|\*|~~|`).+?(?:\*\*\*|\*\*|\*|~~|`))/);
    let elements = [];
  
    formattedText.forEach((part, i) => {
      if (part.startsWith('***') && part.endsWith('***')) {
        elements.push(
          <span key={`${index}-${i}`} style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
            {part.slice(3, -3)}
          </span>
        );
      } else if (part.startsWith('**') && part.endsWith('**')) {
        elements.push(
          <span key={`${index}-${i}`} style={{ fontWeight: 'bold' }}>
            {part.slice(2, -2)}
          </span>
        );
      } else if (part.startsWith('*') && part.endsWith('*')) {
        elements.push(
          <span key={`${index}-${i}`} style={{ fontStyle: 'italic' }}>
            {part.slice(1, -1)}
          </span>
        );
      } else if (part.startsWith('~~') && part.endsWith('~~')) {
        elements.push(
          <span key={`${index}-${i}`} style={{ textDecoration: 'line-through' }}>
            {part.slice(2, -2)}
          </span>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        elements.push(
          <span key={`${index}-${i}`} style={{ backgroundColor: '#D3D3D3', borderRadius: '4px', padding: '0 4px' }}>
            {part.slice(1, -1)}
          </span>
        );
      } else {
        elements.push(<React.Fragment key={`${index}-${i}`}>{part}</React.Fragment>);
      }
    });
  
    return elements;
  };

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
        formattedContent.push(
          <SyntaxHighlighter
            key={index}
            language="python"
            style={docco}
            customStyle={{
              backgroundColor: '#D3D3D3',
              padding: '10px',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              margin: '4px 0',
              textAlign: 'left',
            }}
            wrapLines={true}
          >
            {codeSnippet}
          </SyntaxHighlighter>
        );
        codeSnippet = '';
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeSnippet += line + '\n';
      continue;
    }

    if (line.startsWith('> ')) {
      const quote = line.slice(2);
      formattedContent.push(
        <div key={index} className="quote">
          {processText(quote, index)}
        </div>
      );
    } else if (line.startsWith('- ')) {
        const listItem = line.slice(2);
        formattedContent.push(
          <div key={index} className="list-item">
            <span>-&nbsp;{processText(listItem, index)}</span>
          </div>
        );
    } else if (line.match(/^\d+\. /)) {
        const listItem = line.replace(/^\d+\. /, '');
        formattedContent.push(
            <div key={index} className="list-item">
            <span>{line.match(/^\d+\./)[0]}&nbsp;{processText(listItem, index)}</span>
            </div>
    );
    } else if (line.trim() === '---') {
      formattedContent.push(
        <hr key={index} />
      );
    } else if (line.trim() === '') {
      formattedContent.push(
        <div key={index} style={{ height: '1em' }}></div>
      );
    } else if (line.startsWith('#')) {
        const headerLevel = line.indexOf(' ') + 1;
        const headerText = line.slice(headerLevel);
        const HeaderTag = `h${headerLevel}`;
        formattedContent.push(
            <HeaderTag key={index} className={`header-${headerLevel}`} style={{ margin: '0' }}>
            {processText(headerText, index)}
            </HeaderTag>
        );
    } else {
        formattedContent.push(
          <div key={index}>
            {processText(line, index)}
            <br />
          </div>
        );
    }
    }

  return <>{formattedContent}</>;
};

export default FormattedContent;
