// components/admin/RichTextEditor.jsx
'use client';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function RichTextEditor({ value, onChange }) {
  return (
    <div className="border rounded-md overflow-hidden">
      <CKEditor
        editor={ClassicEditor}
        data={value || ''}
        onChange={(_, editor) => onChange(editor.getData())}
        config={{
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'blockQuote',
            'undo',
            'redo',
          ],
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            ],
          },
        }}
      />
    </div>
  );
}