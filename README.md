# content-completeness
DHIS2 data element based content completeness reporting app. 

DHIS2's core functionality supports for generating data set report completeness. However, data set completeness doesn't tell content wise completeness, it only tells whether a "complete" button is clicked or not. This provides a wrong sense of "we have reported completed". With the content completeness app, we evaluate how many of the data elements from the data set have value entered for them.

## Contribute

### Set up the development environment

> **Note:** The setup has been tested with yarn. You can install yarn through npm by running `npm install -g yarn`. For more info > on yarn check out https://yarnpkg.com/.

### Running the devevelopment server

To run the development server you can run the following command.

```
yarn start
```

This starts the development server on port `8081`.
