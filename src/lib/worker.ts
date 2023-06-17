import { PyodideInterface, loadPyodide } from 'pyodide/pyodide.js';

declare global {
  interface Window {
    pyodide: PyodideInterface;
  }
}

async function initialize() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  //   console.log = function (_message) {
  //     self.postMessage({ result: _message });
  //   };
  console.error = function (_message) {
    self.postMessage({ result: _message });
  };
  console.warn = function (_message) {
    self.postMessage({ result: _message });
  };
  self.pyodide = await loadPyodide({
    indexURL: '/wheels',
    stdout: (text) => self.postMessage({ result: text }),
    stderr: (text) => self.postMessage({ result: text }),
    fullStdLib: false,
  });
  await self.pyodide.loadPackage([
    'pandas',
    'numpy',
    'python-dateutil',
    'six',
    'pytz',
    'opencv-python',
    'click',
    'cryptography',
    'openssl',
    'cffi',
    'pycparser',
  ]);
  await self.pyodide.runPython(`
    import micropip
    async def install():
     await micropip.install('/wheels/PyMuPDF-1.22.3-cp311-cp311-emscripten_3_1_32_wasm32.whl')
     await micropip.install('/wheels/pdf_parser-1.0.0-py3-none-any.whl')
    install()
    `);
}

const initialized = initialize();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.onmessage = async function (_e) {
  await initialized;
  self.postMessage({ result: 'Fetching file' });
  const file = await fetch('/r.pdf');
  const fileData = await file.arrayBuffer();
  const arrayBufferView = new Uint8Array(fileData);
  self.pyodide.FS.writeFile('/result.pdf', arrayBufferView);
  self.postMessage({ result: 'File fetched' });
  console.log('Pyodide is ready');
  const parser = self.pyodide.pyimport('pdf_parser');
  await self.pyodide.runPythonAsync(`
    import logging
    logger = logging.getLogger('pdf_parser')
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    consoleHandler = logging.StreamHandler()
    consoleHandler.setFormatter(formatter)
    logger.addHandler(consoleHandler)
`);
  const _parsed = parser.parse_pdf('/result.pdf', '/log.txt');
  console.log(_parsed.toJs());
  self.postMessage({ result: 'Pyodide is ready', parsed: JSON.parse(JSON.stringify(_parsed.toJs())) });
};
