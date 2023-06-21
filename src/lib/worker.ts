import fetchProgress from 'fetch-progress';
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
  if (!self.pyodide.FS.analyzePath('/wheels/results').exists) {
    console.log('results does not exist');
    self.pyodide.FS.mkdir('/wheels/results');
  }
  if (!self.pyodide.FS.analyzePath('/wheels/pdf_parser-1.0.0-py3-none-any.whl').exists) {
    console.log('wheels does not exist');
    const zipPackageData = await fetch('/wheels/wheels.zip')
      .then(
        fetchProgress({
          onProgress(progress) {
            self.postMessage({ type: 'progress', result: progress.transferred, total: progress.total });
          },
          onError(err) {
            console.log(err);
          },
        }),
      )
      .then((response) => response.arrayBuffer())
      .then((zipPackageData) => zipPackageData);
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

self.onmessage = async function (e: MessageEvent<{ file: string; pages: string }>) {
  await initialized;
  const { file: uri, pages } = e.data;
  if (alreadyRunning) {
    return;
  }
  alreadyRunning = true;
  self.postMessage({ result: 'Fetching file' });
  const file = await fetch(uri);
  const fileData = await file.arrayBuffer();
  const arrayBufferView = new Uint8Array(fileData);
  self.pyodide.FS.writeFile('/result.pdf', arrayBufferView);
  self.postMessage({ result: 'File fetched' });
  console.log('Pyodide is ready');
  await self.pyodide.runPythonAsync(`
  from pdf_parser import parse_pdf
  import logging
  from json import dumps
  logger = logging.getLogger()
  camelotLogger = logging.getLogger('camelot')
  formatter = logging.Formatter('%(name)s - %(levelname)s - %(message)s')
  consoleHandler = logging.StreamHandler()
  consoleHandler.setFormatter(formatter)
  camelotLogger.handlers.clear()
  logger.addHandler(consoleHandler)
  logger.setLevel(logging.INFO)

`);
  const parser = self.pyodide.runPython(`
  from json import dumps,loads
  import os
  from pathlib import Path
  os.chdir('/wheels/results')

  def parse(file_path, file_name=None, pages="1-end", merge_tables=False, final_data_path=None):
    if file_name is None:
      file_name = Path(file_path).stem + ".json"
    else:
      file_name = os.path.basename(file_name)
    if final_data_path is not None and merge_tables is True:
      with open(final_data_path) as f:
        final_data = loads(f.read())
    else:
      final_data = {}
    json_object = dumps(parse_pdf(file_path, pages=str(pages), final_data=final_data))
    with open(file_name, "w") as outfile:
      outfile.write(json_object)
    return Path(file_name).absolute().as_posix()
  parse
  `);
  const json = parser.callKwargs('/result.pdf', { pages: pages === '' ? '1-end' : pages });
  const result_js = self.pyodide.FS.readFile(json, { encoding: 'utf8' });
  parser.destroy();
  self.postMessage({ result: 'Exit', parsed: JSON.parse(result_js) });
  alreadyRunning = false;
};
