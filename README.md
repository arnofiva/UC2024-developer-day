# UC2024: Urban change over time

This app demonstrates how you can use 3D object layers to visualize and apply changes in a system of record.

![Download 3D Buildings and Terrain](https://www.arcgis.com/sharing/content/items/30bd624de45247dfa53320a8213729a4/resources/screenshots/02-download-3d-data.png)

See the [description](./DESCRIPTION.md) for more info on this demo app.

## Prerequisites

- Node.js 16.0+

The template comes set up with Prettier for formatting. Take a look at their [editor integration docs](https://prettier.io/docs/en/editors) to integrate it into your development environment.

## Run project locally

To start:

```
npm install
npm run dev
```

Then open your browser at http://localhost:3000/

## Create productive build

```
npm run build
```

The `dist` folder then contains all the files for the web app which can either be copied to a web server or pushed to the `gh-pages` branch to be served at `https://arnofiva.github.io/arcgis-core-template`.

In order to use the `gh-pages` approach, see the following instructions. Make sure you remove an existing `dist` folder if it has been created from a previous build.

## Deployment

The project uses a [GitHub Action](https://github.com/features/actions) script (see [`publish.yml`](.github/workflows/publish.yml)) to build and publish the app to [GitHub Pages](https://pages.github.com/).

## Licensing

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt](./license.txt) file.
