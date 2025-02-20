import express from 'express';
import { db } from './db.js'; 

const app = express();
// parse json
app.use(express.json());
const PORT = 3000;

//get-users
app.get('/get-users', (req, res) => {
    const query = "SELECT * FROM users";
    db.query(query)
    .then(users => {
        res.status(200).json({ users: users.rows });
    });
});

//get-titles
app.get('/get-titles', (req, res) => {
    const query = "SELECT * FROM titles";
    db.query(query)
    .then(titles => {
        res.status(200).json({ titles: titles.rows });
    });
});

//get-lists
app.get('/get-lists', (req, res) => {
    const query = "SELECT * FROM lists";
    db.query(query)
    .then(lists => {
        res.status(200).json({ lists: lists.rows });
    });
});

app.post('/check-user', (req, res) => {
    const { username , password } = req.body;

    const query = "SELECT * FROM users WHERE username =$1 AND password=$2";

    db.query(query, [username, password])
    .then(result => {
        if (result.rowCount > 0){
            res.status(200).json({ exist: true });
        }

        else {
            res.status(200).json({ exist: false});
        }
    })
})

app.post('/register', (req,res) => {
    const { username, password, fname, lname } =req.body;

    const query = " INSERT INTO users (username, password, fname, lname) VALUES ($1,$2,$3,$4)";

    db.query(query, [username, password, fname, lname])
    .then(result => {
        res.status(200).json({ success: true });
    })

})

/* app.post('/add-titles', (req,res) => {
    const { id, username, title, date_modified, status } =req.body;

    const query = "INSERT INTO titles ( id, username, title, date_modified, status) VALUES ($1,$2,$3,$4,$5)";

    db.query(query, [ id, username, title, date_modified, status])
    .then(result => {
        res.status(200).json({ success: true });
    })

})

app.post('/add-lists', (req,res) => {
    const { id, title_id, list_desc, status } =req.body;

    const query = "INSERT INTO lists ( id, title_id, list_desc, status) VALUES ($1,$2,$3,$4)";

    db.query(query, [ id, title_id, list_desc, status])
    .then(result => {
        res.status(200).json({ success: true });
    })

}) */
app.post('/add-to-do', (req, res) => {
    const { username, title, lists } = req.body;
    const status = true;
    const date_modified = new Date().toISOString().split('T')[0];;
    
    const tquery = "INSERT INTO titles (username, title, date_modified, status) VALUES ($1, $2, $3, $4) RETURNING id";
        
    db.query(tquery, [username, title, date_modified, status], (err, tResult) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to add title" });
        const title_id = tResult.rows[0].id;
        const listquery = "INSERT INTO lists (title_id, list_desc, status) VALUES ($1, $2, $3)";
    
        lists.forEach(list_desc => db.query(listquery, [title_id, list_desc, status]));
        
        res.json({ success: true, message: "Successfully Added" });
    });
});

app.post('/delete-to-do', (req, res) => {
    const { title_id } = req.body;

    const deleteListsQuery = "DELETE FROM lists WHERE title_id = $1";
    const deleteTitleQuery = "DELETE FROM titles WHERE id = $1";

    db.query(deleteListsQuery, [title_id], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to delete lists" });

        db.query(deleteTitleQuery, [title_id], (err) => {
            if (err) return res.status(500).json({ success: false, message: "Failed to delete title" });

            res.json({ success: true, message: "To-do Successfully deleted" });
        });
    });
});

app.post('/update-status', (req, res) => {
    const { title_id, id, status } = req.body;

    const updateQuery = "UPDATE lists SET status = $1 WHERE title_id = $2 AND id = $3";

    db.query(updateQuery, [status, title_id, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to update status" });

        if (result.rowCount === 0) {
            return res.status(500).json({ success: false, message: "Database error: No matching list found" });
        }        

        res.json({ success: true, message: "List Status Successfully Updated" });
    });
});

app.post('/update-to-do', (req, res) => {
    const { title_id, lists } = req.body;

    const deleteListsQuery = "DELETE FROM lists WHERE title_id = $1";

    db.query(deleteListsQuery, [title_id], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to update lists" });

        const insertListQuery = "INSERT INTO lists (title_id, list_desc, status) VALUES ($1, $2, $3)";
        const status = true;

        lists.forEach(list_desc => {
            db.query(insertListQuery, [title_id, list_desc, status]);
        });

        res.json({ success: true, message: "To-do successfully updated" });
    });
});



//INDEX ROUTE
app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/to-do', (req, res) => {
    res.send('This is to-do homepage');
});

/* app.post('/add-to-do', (req, res) => {
    //Object Destructuring
    const { fname, lname} = req.body;
    res.send(`Hello ${fname} ${lname}`);
});
 */

/* app.post('/add-titles', (req, res) => {
    const { fname, lname} = req.body;
    res.send(`Hello ${fname} ${lname}`);
}); */

app.get('/update-to-do', (req, res) => {
    res.send('This is Update to-do homepage');
});

app.get('/delete-to-do', (req, res) => {
    res.send('This is Delete to-do homepage');
});
app.listen(PORT,() => {
    console.log(`Server is running on Port ${PORT}`);
});