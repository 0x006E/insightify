import { PyodideInterface, loadPyodide } from 'pyodide/pyodide.js';

declare global {
  interface Window {
    pyodide: PyodideInterface;
  }
}

const { fetch: originalFetch } = self;

self.fetch = async (...args) => {
  const [resource, config] = args;
  if (resource.toString().startsWith('emfs://')) {
    const path = resource.toString().replace('emfs://', '');
    const response = self.pyodide.FS.readFile(path);
    return {
      bodyUsed: false,
      headers: {},
      ok: true,
      redirected: false,
      status: 200,
      statusText: 'OK',
      type: 'basic',
      url: resource,
      arrayBuffer: () => response.buffer,
    } as Response;
  }

  const response = await originalFetch(resource, config);
  return response;
};

const FILE_IO = (() => {
  'use strict';

  function closeFS() {
    return new Promise((resolve, reject) => {
      self.pyodide.FS.syncfs(false, (err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  function initFS(path: string) {
    self.pyodide.FS.mkdir(path);
    self.pyodide.FS.mount(self.pyodide.FS.filesystems.IDBFS, {}, path);

    return new Promise((resolve, reject) => {
      self.pyodide.FS.syncfs(true, (err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  return {
    closeFS: closeFS,
    initFS: initFS,
  };
})();

let alreadyRunning = false;

async function initialize() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  console.log = function (_message) {
    self.postMessage({ result: _message });
  };
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
  await FILE_IO.initFS('/wheels');
  console.log('Mount path');
  if (!self.pyodide.FS.analyzePath('/wheels/pdf_parser-1.0.0-py3-none-any.whl').exists) {
    console.log('wheels does not exist');
    const zipPackage = await fetch('/wheels/wheels.zip');
    const zipPackageData = await zipPackage.arrayBuffer();
    console.log('Fetched wheels');
    self.pyodide.unpackArchive(zipPackageData, 'zip', { extractDir: '/wheels' });
    console.log('Unpacked wheels');
    await FILE_IO.closeFS();
  }
  await self.pyodide.loadPackage(['sqlite3', 'openssl', 'micropip']);
  const packages =
    '/wheels/cffi-1.15.1-cp311-cp311-emscripten_3_1_32_wasm32.whl,/wheels/chardet-5.1.0-py3-none-any.whl,/wheels/charset_normalizer-3.1.0-py3-none-any.whl,/wheels/click-8.1.3-py3-none-any.whl,/wheels/cryptography-39.0.2-cp311-cp311-emscripten_3_1_32_wasm32.whl,/wheels/dpath-2.1.6-py3-none-any.whl,/wheels/et_xmlfile-1.1.0-py3-none-any.whl,/wheels/numpy-1.24.2-cp311-cp311-emscripten_3_1_32_wasm32.whl,/wheels/opencv_python-4.7.0.72-cp311-cp311-emscripten_3_1_32_wasm32.whl,/wheels/openpyxl-3.1.2-py2.py3-none-any.whl,/wheels/pandas-1.5.3-cp311-cp311-emscripten_3_1_32_wasm32.whl,/wheels/pdfminer.six-20221105-py3-none-any.whl,/wheels/pycparser-2.21-py2.py3-none-any.whl,/wheels/PyMuPDF-1.22.3-cp311-cp311-emscripten_3_1_32_wasm32.whl,/wheels/pypdf-3.9.1-py3-none-any.whl,/wheels/python_dateutil-2.8.2-py2.py3-none-any.whl,/wheels/pytz-2023.3-py2.py3-none-any.whl,/wheels/six-1.16.0-py2.py3-none-any.whl,/wheels/tabulate-0.9.0-py3-none-any.whl,/wheels/camelot_fork-0.20.1-py3-none-any.whl,/wheels/pdf_parser-1.0.0-py3-none-any.whl';
  const packagePaths = packages.split(',').map((p) => `emfs://${p}`);
  for (const pkg of packagePaths) {
    await self.pyodide.loadPackage(pkg, { messageCallback: (text) => self.postMessage({ result: text }) });
  }
}

const initialized = initialize();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
self.onmessage = async function (_e) {
  await initialized;
  if (alreadyRunning) {
    return;
  }
  alreadyRunning = true;
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
  logger = logging.getLogger()
  camelotLogger = logging.getLogger('camelot')
  formatter = logging.Formatter('%(name)s - %(levelname)s - %(message)s')
  consoleHandler = logging.StreamHandler()
  consoleHandler.setFormatter(formatter)
  camelotLogger.handlers.clear()
  logger.addHandler(consoleHandler)
  logger.setLevel(logging.INFO)
`);
  const _parsed = parser.parse_pdf('/result.pdf');
  self.postMessage({ result: 'Exit', parsed: JSON.stringify(_parsed.toJs()) });
  alreadyRunning = false;
};
