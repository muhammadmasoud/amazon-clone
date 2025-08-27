# Amazon Clone - ERD Visual Formats

## Mermaid.js ERD (Copy this to mermaid.live or use in Markdown)

```mermaid
erDiagram
    USER {
        int id PK
        string username UK
        string first_name
        string last_name
        string email UK
        string mobile
        text address
        boolean is_email_verified
        uuid email_verification_token
        uuid password_reset_token
        datetime password_reset_token_created
        datetime date_joined
        datetime last_login
        boolean is_active
        boolean is_staff
        boolean is_superuser
    }

    CATEGORY {
        int id PK
        string name UK
        text description
    }

    PRODUCT {
        int id PK
        string title
        text description
        decimal unit_price
        string image
        int stock
        datetime date_added
        int category_id FK
    }

    CART {
        int id PK
        int user_id FK
        datetime created_at
        datetime updated_at
        string promo_code
        decimal discount_amount
    }

    CART_ITEM {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
        decimal price_when_added
        datetime added_at
        datetime updated_at
    }

    ORDER {
        int id PK
        string order_number UK
        int user_id FK
        text shipping_address
        string shipping_city
        string shipping_state
        string shipping_zip
        string shipping_country
        string shipping_phone
        datetime created_at
        datetime updated_at
        datetime confirmed_at
        datetime shipped_at
        datetime delivered_at
        boolean is_paid
        string payment_method
        datetime payment_date
        string status
        decimal subtotal
        decimal shipping_cost
        decimal tax_amount
        decimal discount_amount
        decimal total_amount
        text customer_notes
        text admin_notes
        string tracking_number
        string courier_service
        string promo_code
    }

    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price
        string product_title
        string product_sku
        boolean is_fulfilled
        datetime fulfilled_at
        datetime created_at
    }

    PAYMENT {
        int id PK
        string payment_id UK
        string stripe_payment_intent_id
        int order_id FK
        int user_id FK
        decimal amount
        string currency
        string payment_method
        string status
        string stripe_client_secret
        string stripe_charge_id
        datetime created_at
        datetime updated_at
        datetime paid_at
        text failure_reason
        text refund_reason
    }

    REVIEW {
        int id PK
        int product_id FK
        int user_id FK
        string title
        text content
        int rating
        datetime created_at
    }

    CONTACT_MESSAGE {
        uuid id PK
        int user_id FK
        string name
        string email
        string subject
        string category
        text message
        string order_number
        string status
        datetime created_at
        datetime updated_at
        boolean response_sent
        datetime response_sent_at
    }

    STRIPE_WEBHOOK_EVENT {
        int id PK
        string stripe_event_id UK
        string event_type
        boolean processed
        datetime created_at
    }

    %% Relationships
    USER ||--|| CART : "has one"
    USER ||--o{ ORDER : "places many"
    USER ||--o{ REVIEW : "writes many"
    USER ||--o{ PAYMENT : "makes many"
    USER ||--o{ CONTACT_MESSAGE : "sends many"
    
    CATEGORY ||--o{ PRODUCT : "contains many"
    
    PRODUCT ||--o{ CART_ITEM : "appears in many"
    PRODUCT ||--o{ ORDER_ITEM : "appears in many"
    PRODUCT ||--o{ REVIEW : "has many"
    
    CART ||--o{ CART_ITEM : "contains many"
    
    ORDER ||--o{ ORDER_ITEM : "contains many"
    ORDER ||--|| PAYMENT : "has one"
```

## PlantUML Format (Copy this to plantuml.com)

```plantuml
@startuml Amazon_Clone_ERD

!define primary_key(x) <b><color:red>PK: x</color></b>
!define foreign_key(x) <color:blue>FK: x</color>
!define unique_key(x) <color:green>UK: x</color>

entity "USER" as user {
  primary_key(id: int)
  unique_key(username: varchar(150))
  first_name: varchar(30)
  last_name: varchar(30)
  unique_key(email: varchar(254))
  mobile: varchar(50)
  address: text
  is_email_verified: boolean
  email_verification_token: uuid
  password_reset_token: uuid
  password_reset_token_created: datetime
  date_joined: datetime
  last_login: datetime
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
}

entity "CATEGORY" as category {
  primary_key(id: int)
  unique_key(name: varchar(255))
  description: text
}

entity "PRODUCT" as product {
  primary_key(id: int)
  title: varchar(255)
  description: text
  unit_price: decimal(10,2)
  image: varchar(255)
  stock: smallint
  date_added: datetime
  foreign_key(category_id: int)
}

entity "CART" as cart {
  primary_key(id: int)
  foreign_key(user_id: int)
  created_at: datetime
  updated_at: datetime
  promo_code: varchar(50)
  discount_amount: decimal(10,2)
}

entity "CART_ITEM" as cart_item {
  primary_key(id: int)
  foreign_key(cart_id: int)
  foreign_key(product_id: int)
  quantity: int
  price_when_added: decimal(10,2)
  added_at: datetime
  updated_at: datetime
}

entity "ORDER" as order {
  primary_key(id: int)
  unique_key(order_number: varchar(20))
  foreign_key(user_id: int)
  shipping_address: text
  shipping_city: varchar(100)
  shipping_state: varchar(100)
  shipping_zip: varchar(20)
  shipping_country: varchar(100)
  shipping_phone: varchar(20)
  created_at: datetime
  updated_at: datetime
  confirmed_at: datetime
  shipped_at: datetime
  delivered_at: datetime
  is_paid: boolean
  payment_method: varchar(20)
  payment_date: datetime
  status: varchar(20)
  subtotal: decimal(10,2)
  shipping_cost: decimal(10,2)
  tax_amount: decimal(10,2)
  discount_amount: decimal(10,2)
  total_amount: decimal(10,2)
  customer_notes: text
  admin_notes: text
  tracking_number: varchar(100)
  courier_service: varchar(100)
  promo_code: varchar(50)
}

entity "ORDER_ITEM" as order_item {
  primary_key(id: int)
  foreign_key(order_id: int)
  foreign_key(product_id: int)
  quantity: int
  price: decimal(10,2)
  product_title: varchar(255)
  product_sku: varchar(100)
  is_fulfilled: boolean
  fulfilled_at: datetime
  created_at: datetime
}

entity "PAYMENT" as payment {
  primary_key(id: int)
  unique_key(payment_id: varchar(50))
  stripe_payment_intent_id: varchar(200)
  foreign_key(order_id: int)
  foreign_key(user_id: int)
  amount: decimal(10,2)
  currency: varchar(3)
  payment_method: varchar(20)
  status: varchar(20)
  stripe_client_secret: varchar(500)
  stripe_charge_id: varchar(200)
  created_at: datetime
  updated_at: datetime
  paid_at: datetime
  failure_reason: text
  refund_reason: text
}

entity "REVIEW" as review {
  primary_key(id: int)
  foreign_key(product_id: int)
  foreign_key(user_id: int)
  title: varchar(255)
  content: text
  rating: smallint
  created_at: datetime
}

entity "CONTACT_MESSAGE" as contact {
  primary_key(id: uuid)
  foreign_key(user_id: int)
  name: varchar(100)
  email: varchar(254)
  subject: varchar(200)
  category: varchar(20)
  message: text
  order_number: varchar(50)
  status: varchar(15)
  created_at: datetime
  updated_at: datetime
  response_sent: boolean
  response_sent_at: datetime
}

' Relationships
user ||--|| cart : "1:1"
user ||--o{ order : "1:M"
user ||--o{ review : "1:M"
user ||--o{ payment : "1:M"
user ||--o{ contact : "1:M"

category ||--o{ product : "1:M"

product ||--o{ cart_item : "1:M"
product ||--o{ order_item : "1:M"
product ||--o{ review : "1:M"

cart ||--o{ cart_item : "1:M"

order ||--o{ order_item : "1:M"
order ||--|| payment : "1:1"

@enduml
```

## DBDiagram.io Format (Copy this to dbdiagram.io)

```sql
Table users {
  id integer [primary key]
  username varchar(150) [unique]
  first_name varchar(30)
  last_name varchar(30)
  email varchar(254) [unique]
  mobile varchar(50)
  address text
  is_email_verified boolean
  email_verification_token uuid
  password_reset_token uuid
  password_reset_token_created datetime
  date_joined datetime
  last_login datetime
  is_active boolean
  is_staff boolean
  is_superuser boolean
}

Table categories {
  id integer [primary key]
  name varchar(255) [unique]
  description text
}

Table products {
  id integer [primary key]
  title varchar(255)
  description text
  unit_price decimal(10,2)
  image varchar(255)
  stock smallint
  date_added datetime
  category_id integer
}

Table carts {
  id integer [primary key]
  user_id integer
  created_at datetime
  updated_at datetime
  promo_code varchar(50)
  discount_amount decimal(10,2)
}

Table cart_items {
  id integer [primary key]
  cart_id integer
  product_id integer
  quantity integer
  price_when_added decimal(10,2)
  added_at datetime
  updated_at datetime
}

Table orders {
  id integer [primary key]
  order_number varchar(20) [unique]
  user_id integer
  shipping_address text
  shipping_city varchar(100)
  shipping_state varchar(100)
  shipping_zip varchar(20)
  shipping_country varchar(100)
  shipping_phone varchar(20)
  created_at datetime
  updated_at datetime
  confirmed_at datetime
  shipped_at datetime
  delivered_at datetime
  is_paid boolean
  payment_method varchar(20)
  payment_date datetime
  status varchar(20)
  subtotal decimal(10,2)
  shipping_cost decimal(10,2)
  tax_amount decimal(10,2)
  discount_amount decimal(10,2)
  total_amount decimal(10,2)
  customer_notes text
  admin_notes text
  tracking_number varchar(100)
  courier_service varchar(100)
  promo_code varchar(50)
}

Table order_items {
  id integer [primary key]
  order_id integer
  product_id integer
  quantity integer
  price decimal(10,2)
  product_title varchar(255)
  product_sku varchar(100)
  is_fulfilled boolean
  fulfilled_at datetime
  created_at datetime
}

Table payments {
  id integer [primary key]
  payment_id varchar(50) [unique]
  stripe_payment_intent_id varchar(200)
  order_id integer
  user_id integer
  amount decimal(10,2)
  currency varchar(3)
  payment_method varchar(20)
  status varchar(20)
  stripe_client_secret varchar(500)
  stripe_charge_id varchar(200)
  created_at datetime
  updated_at datetime
  paid_at datetime
  failure_reason text
  refund_reason text
}

Table reviews {
  id integer [primary key]
  product_id integer
  user_id integer
  title varchar(255)
  content text
  rating smallint
  created_at datetime
}

Table contact_messages {
  id uuid [primary key]
  user_id integer
  name varchar(100)
  email varchar(254)
  subject varchar(200)
  category varchar(20)
  message text
  order_number varchar(50)
  status varchar(15)
  created_at datetime
  updated_at datetime
  response_sent boolean
  response_sent_at datetime
}

// Relationships
Ref: users.id - carts.user_id
Ref: users.id < orders.user_id
Ref: users.id < reviews.user_id
Ref: users.id < payments.user_id
Ref: users.id < contact_messages.user_id

Ref: categories.id < products.category_id

Ref: products.id < cart_items.product_id
Ref: products.id < order_items.product_id
Ref: products.id < reviews.product_id

Ref: carts.id < cart_items.cart_id

Ref: orders.id < order_items.order_id
Ref: orders.id - payments.order_id
```

## How to Use These Formats:

### 1. **Mermaid.js** (Recommended)
- Copy the Mermaid code
- Go to [mermaid.live](https://mermaid.live)
- Paste the code and generate a beautiful ERD
- Export as PNG, SVG, or PDF

### 2. **PlantUML**
- Copy the PlantUML code
- Go to [plantuml.com](http://www.plantuml.com/plantuml/uml/)
- Paste the code and generate the diagram
- Download as PNG or SVG

### 3. **DBDiagram.io**
- Copy the SQL-like syntax
- Go to [dbdiagram.io](https://dbdiagram.io)
- Paste the code for an interactive database diagram
- Export as PDF or PNG

### 4. **VS Code Extensions**
You can also install these VS Code extensions to view the diagrams directly:
- **Mermaid Preview** - for Mermaid diagrams
- **PlantUML** - for PlantUML diagrams

These tools will generate professional-looking ERD images that you can use in presentations, documentation, or share with your team!
