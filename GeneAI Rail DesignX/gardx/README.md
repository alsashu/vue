# gardx

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Data Flow

[User draws component]
↓
[Vue sends layout JSON]
↓
[Editor Service validates]
↓
[AI Suggestion Service returns alternatives]
↓
[User selects best design]
↓
[Real-Time Feedback Service analyzes]
↓
[Export Service generates output]

## JSON server

Command to run json-server --watch 'data/db.json'
