// @vitest-environment jsdom

import ReactDOMServer from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/platform', () => ({
  default: {
    type: 'desktop',
    exporter: { exportByUrl: vi.fn(), exportImageFile: vi.fn() },
  },
}))

vi.mock('./Artifact', () => ({
  isRenderableCodeLanguage: () => false,
}))

import Markdown from './Markdown'

describe('Markdown server rendering', () => {
  it('gives mixed-language text blocks independent automatic direction without changing text', () => {
    const source = '# عنوان فارسی\n\nسلام، API آماده است.\n\nThis paragraph quotes سلام and stays English.\n\n- مورد فارسی\n- English item\n\n| عنوان | Name |\n| --- | --- |\n| فارسی | English |'
    const html = ReactDOMServer.renderToStaticMarkup(<Markdown>{source}</Markdown>)
    const container = document.createElement('div')
    container.innerHTML = html
    const blocks = container.querySelectorAll('h1, p, li, th, td')
    expect(blocks.length).toBe(9)
    for (const block of Array.from(blocks)) expect(block.getAttribute('dir')).toBe('auto')
    expect(container.querySelectorAll('p')[0].textContent).toBe('سلام، API آماده است.')
    expect(container.querySelectorAll('p')[1].textContent).toBe('This paragraph quotes سلام and stays English.')
  })

  it('isolates inline code and links while preserving their text and destination', () => {
    const source = 'مسیر `C:\\Project\\ChatBox` و `const greeting = "سلام";`، [راهنمای فارسی](https://example.com/docs?x=1&y=2) و https://api.avalai.ir/v1'
    const html = ReactDOMServer.renderToStaticMarkup(<Markdown>{source}</Markdown>)
    const container = document.createElement('div')
    container.innerHTML = html
    const codes = container.querySelectorAll('code')
    expect(codes[0].textContent).toBe('C:\\Project\\ChatBox')
    expect(codes[1].textContent).toBe('const greeting = "سلام";')
    for (const code of Array.from(codes)) {
      expect(code.getAttribute('dir')).toBe('ltr')
      expect(code.style.unicodeBidi).toBe('isolate')
    }
    const links = container.querySelectorAll('a')
    expect(links[0].textContent).toBe('راهنمای فارسی')
    expect(links[0].getAttribute('href')).toBe('https://example.com/docs?x=1&y=2')
    expect(links[1].textContent).toBe('https://api.avalai.ir/v1')
    for (const link of Array.from(links)) {
      expect(link.getAttribute('dir')).toBe('auto')
      expect(link.style.unicodeBidi).toBe('isolate')
    }
  })
  it('attaches source-stable identities to actual rendered Markdown blocks', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <Markdown uniqueId="message-0">{'First paragraph\n\nSecond paragraph'}</Markdown>
    )
    expect(html).toContain('data-transcript-block="message-0:0"')
    expect(html).toContain('data-transcript-block="message-0:17"')
  })

  it('keeps image rendering available to HTML exports without client providers', () => {
    const html = ReactDOMServer.renderToStaticMarkup(
      <Markdown>{'![Exported image](https://example.com/exported.png)'}</Markdown>
    )

    expect(html).toContain('src="https://example.com/exported.png"')
    expect(html).toContain('alt="Exported image"')
  })
})
