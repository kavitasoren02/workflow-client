import type React from "react";

interface FormattedMessageProps {
  content: string;
}

export default function FormattedMessage({ content }: FormattedMessageProps) {
  // Parse and format the message content
  const formatMessage = (text: string) => {
    // Split by double newlines to create paragraphs
    const sections = text.split("\n\n");

    return sections.map((section, sectionIndex) => {
      const lines = section.split("\n");
      const elements: React.ReactNode[] = [];

      lines.forEach((line, lineIndex) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) return;

        // Handle headers (lines ending with colon and starting with **)
        if (trimmedLine.match(/^\*\*.*:\*\*$/)) {
          const headerText = trimmedLine.replace(/^\*\*|\*\*$/g, "");
          elements.push(
            <h3
              key={`header-${sectionIndex}-${lineIndex}`}
              className="font-bold text-lg text-gray-900 mb-2 mt-4 first:mt-0"
            >
              {headerText}
            </h3>
          );
        }
        // Handle bold section headers (lines with ** around them)
        else if (trimmedLine.match(/^\*\*.*\*\*$/)) {
          const headerText = trimmedLine.replace(/^\*\*|\*\*$/g, "");
          elements.push(
            <h4
              key={`subheader-${sectionIndex}-${lineIndex}`}
              className="font-semibold text-base text-gray-800 mb-2 mt-3 first:mt-0"
            >
              {headerText}
            </h4>
          );
        }
        // Handle numbered lists (1., 2., etc.)
        else if (trimmedLine.match(/^\d+\.\s+/)) {
          const listText = trimmedLine.replace(/^\d+\.\s+/, "");
          elements.push(
            <div
              key={`numbered-${sectionIndex}-${lineIndex}`}
              className="flex items-start gap-2 mb-1"
            >
              <span className="font-medium text-blue-600 min-w-[20px]">
                {trimmedLine.match(/^\d+/)?.[0]}.
              </span>
              <span className="text-gray-700">
                {formatInlineText(listText)}
              </span>
            </div>
          );
        }
        // Handle bullet points (*, -, •)
        else if (trimmedLine.match(/^[*\-•]\s+/)) {
          const bulletText = trimmedLine.replace(/^[*\-•]\s+/, "");
          elements.push(
            <div
              key={`bullet-${sectionIndex}-${lineIndex}`}
              className="flex items-start gap-2 mb-1 ml-4"
            >
              <span className="text-blue-600 font-bold min-w-[8px] mt-1">
                •
              </span>
              <span className="text-gray-700">
                {formatInlineText(bulletText)}
              </span>
            </div>
          );
        }
        // Handle sub-bullets (indented with spaces)
        else if (trimmedLine.match(/^\s{2,}[*\-•]\s+/)) {
          const subBulletText = trimmedLine.replace(/^\s*[*\-•]\s+/, "");
          elements.push(
            <div
              key={`subbullet-${sectionIndex}-${lineIndex}`}
              className="flex items-start gap-2 mb-1 ml-8"
            >
              <span className="text-gray-500 font-bold min-w-[8px] mt-1">
                ◦
              </span>
              <span className="text-gray-600">
                {formatInlineText(subBulletText)}
              </span>
            </div>
          );
        }
        // Handle regular paragraphs
        else {
          elements.push(
            <p
              key={`para-${sectionIndex}-${lineIndex}`}
              className="text-gray-700 mb-2 leading-relaxed"
            >
              {formatInlineText(trimmedLine)}
            </p>
          );
        }
      });

      return (
        <div key={`section-${sectionIndex}`} className="mb-4 last:mb-0">
          {elements}
        </div>
      );
    });
  };

  // Format inline text (bold, italic, code)
  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, index) => {
      // Bold text
      if (part.match(/^\*\*.*\*\*$/)) {
        return (
          <strong key={index} className="font-semibold text-gray-900">
            {part.replace(/^\*\*|\*\*$/g, "")}
          </strong>
        );
      }
      // Italic text
      else if (part.match(/^\*.*\*$/)) {
        return (
          <em key={index} className="italic">
            {part.replace(/^\*|\*$/g, "")}
          </em>
        );
      }
      // Code text
      else if (part.match(/^`.*`$/)) {
        return (
          <code
            key={index}
            className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800"
          >
            {part.replace(/^`|`$/g, "")}
          </code>
        );
      }
      // Regular text
      return part;
    });
  };

  return <div className="formatted-message">{formatMessage(content)}</div>;
}
