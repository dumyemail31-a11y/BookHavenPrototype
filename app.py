from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bookhaven.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)  # In ZAR
    image_url = db.Column(db.String(300))
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship('Category', backref=db.backref('books', lazy=True))
    is_featured = db.Column(db.Boolean, default=False)
    is_best_seller = db.Column(db.Boolean, default=False)

class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    categories = Category.query.all()
    featured_books = Book.query.filter_by(is_featured=True).all()
    best_sellers = Book.query.filter_by(is_best_seller=True).all()
    return render_template('index.html', categories=categories, featured_books=featured_books, best_sellers=best_sellers)

@app.route('/shop')
def shop():
    category = request.args.get('category')
    if category:
        books = Book.query.filter_by(category_id=category).all()
    else:
        books = Book.query.all()
    categories = Category.query.all()
    return render_template('shop.html', books=books, categories=categories)

@app.route('/book/<int:book_id>')
def book_detail(book_id):
    book = Book.query.get_or_404(book_id)
    return render_template('shop-detail.html', book=book)

@app.route('/cart')
@login_required
def cart():
    cart_items = Cart.query.filter_by(user_id=current_user.id).all()
    total = sum(item.book.price * item.quantity for item in cart_items)
    return render_template('cart.html', cart_items=cart_items, total=total)

@app.route('/add_to_cart/<int:book_id>', methods=['POST'])
@login_required
def add_to_cart(book_id):
    quantity = int(request.form.get('quantity', 1))
    existing = Cart.query.filter_by(user_id=current_user.id, book_id=book_id).first()
    if existing:
        existing.quantity += quantity
    else:
        cart_item = Cart(user_id=current_user.id, book_id=book_id, quantity=quantity)
        db.session.add(cart_item)
    db.session.commit()
    flash('Book added to cart!')
    return redirect(url_for('cart'))

@app.route('/checkout')
@login_required
def checkout():
    cart_items = Cart.query.filter_by(user_id=current_user.id).all()
    total = sum(item.book.price * item.quantity for item in cart_items)
    return render_template('checkout.html', cart_items=cart_items, total=total)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        hashed_password = generate_password_hash(password, method='sha256')
        new_user = User(username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        flash('Account created successfully!')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('index'))
        flash('Invalid credentials')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin():
    if not current_user.is_admin:
        return redirect(url_for('index'))
    books = Book.query.all()
    categories = Category.query.all()
    return render_template('admin.html', books=books, categories=categories)

@app.route('/admin/add_book', methods=['POST'])
@login_required
def add_book():
    if not current_user.is_admin:
        return redirect(url_for('index'))
    title = request.form.get('title')
    author = request.form.get('author')
    price = float(request.form.get('price'))
    category_id = int(request.form.get('category'))
    image_url = request.form.get('image_url')
    is_featured = 'is_featured' in request.form
    is_best_seller = 'is_best_seller' in request.form
    new_book = Book(title=title, author=author, price=price, category_id=category_id, image_url=image_url, is_featured=is_featured, is_best_seller=is_best_seller)
    db.session.add(new_book)
    db.session.commit()
    flash('Book added!')
    return redirect(url_for('admin'))

# Other pages
@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact-us.html')

@app.route('/service')
def service():
    return render_template('service.html')

@app.route('/wishlist')
@login_required
def wishlist():
    # Implement wishlist if needed
    return render_template('wishlist.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Seed some data
        if not Category.query.first():
            cat1 = Category(name='Action and Adventure')
            cat2 = Category(name='Classics')
            cat3 = Category(name='Historical Fiction')
            cat4 = Category(name='Literary Fiction')
            cat5 = Category(name='Science Fiction')
            cat6 = Category(name='Biography')
            db.session.add_all([cat1, cat2, cat3, cat4, cat5, cat6])
            db.session.commit()
        if not Book.query.first():
            # Add some sample books
            book1 = Book(title='Zero to One', author='Peter Thiel', price=160, category_id=1, image_url='images/Zero-To-One-by-Peter-Thiel-400x600.jpg', is_featured=True)
            book2 = Book(title='The Alchemist', author='Paulo Coelho', price=160, category_id=2, image_url='images/Alchemist.png', is_best_seller=True)
            # Add more as needed
            db.session.add_all([book1, book2])
            db.session.commit()
        if not User.query.filter_by(is_admin=True).first():
            admin = User(username='admin', email='admin@bookhaven.com', password=generate_password_hash('admin', method='sha256'), is_admin=True)
            db.session.add(admin)
            db.session.commit()
    app.run(debug=True)