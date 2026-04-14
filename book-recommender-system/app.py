from flask import Flask, render_template, request
import joblib
import numpy as np
import pandas as pd  # Import Pandas separately

# Load the data using joblib
popular_df = joblib.load('popular.pkl')
pt = joblib.load('pt.pkl')
books = joblib.load('books.pkl')
similarity_scores = joblib.load('similarity_scores.pkl')

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html',
                       book_name=list(popular_df['Book-Title'].values),
                       author=list(popular_df['Book-Author'].values),
                       image=list(popular_df['Image-URL-M'].values),
                       rating=list(popular_df['avg_rating'].values),
                       votes=list(popular_df['num_ratings'].values)  # Include 'votes' here
                       )


@app.route('/recommend')
def recommend_ui():
    return render_template('recommend.html')

@app.route('/recommend_books', methods=['post'])
def recommend():
    user_input = request.form.get('user_input')
    
    # Check if user_input is in pt.index
    if user_input not in pt.index:
        # Handle the case where user_input is not found
        return render_template('recommend.html', data=[])

    # Continue with the recommendation logic
    index = np.where(pt.index == user_input)[0][0]
    similar_items = sorted(list(enumerate(similarity_scores[index])), key=lambda x: x[1], reverse=True)[1:5]

    data = []
    for i in similar_items:
        item = []
        temp_df = books[books['Book-Title'] == pt.index[i[0]]]
        item.extend(list(temp_df.drop_duplicates('Book-Title')['Book-Title'].values))
        item.extend(list(temp_df.drop_duplicates('Book-Title')['Book-Author'].values))
        item.extend(list(temp_df.drop_duplicates('Book-Title')['Image-URL-M'].values))

        data.append(item)

    return render_template('recommend.html', data=data)


if __name__ == '__main__':
    app.run(debug=True)
