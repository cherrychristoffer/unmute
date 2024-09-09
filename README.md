# Unmute Greetings

This is a Shopify theme extension that houses an editor for creating Unmutes.

## Prerequisites

- You need an S3 bucket to store the images and audio files.
- You need a Shopify store with a theme that supports extensions.

## Working with the extension

You should run

```bash
$ npm run start
```

inside the `unmute-editor` folder to start Webpack.

Then you can run

```bash
$ npm run dev
```

in the root folder to start the Shopify app.

## Deploying

To deploy the extension, run

```bash
$ npm run build
```

within the `unmute-editor` folder.

Then, in the root folder, run

```bash
$ npm run deploy
```

to deploy the extension to your Shopify store.
