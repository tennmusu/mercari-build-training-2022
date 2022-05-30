# STEP7: More Stretches

## 1. (Revision)Get a list of categories
This chapter assumes you have completed [3-8. (Optional) Move the category information to a separate table](https://github.com/mercari-build/mercari-build-training-2022/blob/main/document/step3.en.md )
Make an endpoint GET /categories to return a list of categories.

```
curl -X GET http://127.0.0.1:9000/categories
{"categories":[{"id":1,"name":"fashion"},{"id":2,"name":"food"}]}
```
## 2. Allow a category to be selected from a drop-down menu when adding a new product
Currently, categories are selected by entering text, but this method raises certain concerns.

The concern is, **the likelihood that similar categories will be disrupted by notational distortion** is high. For example, even if you list the same "jacket", it can be listed as "fashion", "clothing", "ファッション(fashion in japanese)", ... and various
categories are possible. Considering this, it is unpredictable what categories users will enter.

Therefore, it is preferable for the **service** to present a list of categories and for the **users** to select the category.


**:book: Reference**
* [\<select>: The HTML Select element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select)
* [\<option>: The HTML Option element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/option)

## 3. Allow frontend to display an error when the 'List this item button' is pressed.
Currently, when the 'List this item button' is pressed, a POST request is thrown to the backend without any consideration of the input status. However, there may be cases where the user's input is incomplete, such as the following.

- The product name has not been entered.
    - The current code was displaying an error
- Category is not selected
- A file with an extension other than jpg has been uploaded.
    - It is possible that a file without even an extension (no period) has been uploaded
- No images were uploaded.
- More than one image has been uploaded
    - The current code does not have the multiple attribute, so only one image could be uploaded.

In the case of such an input condition, present the user with an error message and ask them to change to the correct input condition.
This will prevent **developer's unexpected data from being POSTed, which in turn causes errors on the backend**.

## 4. error handling for backend API
Some of you may have already done this, but let's review `main.py` or `main.go` once again for error handling. After listening to the mentor's talk, I thought it was important to keep the following points in mind.

- User's point of view
    - Return appropriate HTTP status code
        - Return 200 only on success
    - Make it an appropriate error message
        - Since the message is to be displayed to the user, do not disclose more internal information (e.g., what kind of files are present) than necessary. It may give a hint of an attack.
- developer's point of view
    - Leave appropriate error messages in the log.
        - This log is for the developer to see, so leave detailed information. This will make it easier to identify the cause of the error!

**:book: Reference**
* [Best Practices for REST API Error Handling](https://www.baeldung.com/rest-api-error-handling-best-practices)

## 5. Responsive front-end support
Today, there are a variety of devices (PCs, smartphones, tablets, etc.). Make sure the display matches the screen size of each device.

**:book: Reference**
* [Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
## 6. Consider how to handle images on your website
Google recommends 1.6MB of data space for a website (based on a 3G connection). If images uploaded by users are stored as they are, 1.6MB will be easily exceeded. Although the 1.6MB figure is only a guide, we believe that there is no better way to reduce the weight of images. So, try to reduce the data size by resizing or compressing the images.
You can also use [Lighthouse](https://www.npmjs.com/package/lighthouse), which works in a local environment, to check the current site score. What are some possible ways to increase the score?

**:book: Reference**
* [Avoid enormous network payloads](https://web.dev/total-byte-weight/)