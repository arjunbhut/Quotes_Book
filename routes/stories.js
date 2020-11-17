const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')

const Story = require('../models/Story')
const User = require('../models/User');

// @desc    Show add page
// @route   GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
  res.render('stories/add')
})

// @desc    Favourite Stories
// @route   POST /stories/addFavourite
router.post('/addFavourite', ensureAuth, async (req, res) => {
  try {
    
    console.log(req.body.storyId);
    const user = await User.findById(req.user.id);
    let n = user.favourites.includes(req.body.storyId);
    if(!n)
    {
      user.favourites.push(req.body.storyId);
      user.save();
    }
    res.redirect('/stories');

  } catch (err) {
    console.error(err)
    res.render('error/500')
  }

})

// @desc    Display Favourite Stories
// @route   GET /stories/showFavourite
router.get('/showFavourite', ensureAuth, async(req,res) =>{

  const user = await User.findById(req.user.id);
  //console.log(user.favourites);
  const stories = [];
  let size = user.favourites.length;
  let count = 0;
  
  let title = "Your Favourite Quotes";
  if(!size)
  {
    res.render('stories/fav',{
      stories,
      title
    })
  }

  
  user.favourites.forEach( async element => {
    const sto = await Story.findById(element).populate('user').lean().sort({ createdAt: 'desc' });
    stories.push(sto);
  
    count++;
    if(count==size-1)
    {
      res.render('stories/fav', {
        stories,
        title
      })
    }
  });


})

// @desc    Process add form
// @route   POST /stories
router.post('/', ensureAuth, async (req, res) => {
  try {

    if(req.body.title!='' && req.body.body!='')
    {
      //console.log(req.body)
      req.body.user = req.user.id
      await Story.create(req.body)
      res.redirect('/dashboard')
    }
    else
    {
      res.redirect('stories/add');
    }
    
  } catch (err) {
    //console.log(req.body)
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show all stories
// @route   GET /stories
router.get('/', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean()

      console.log(stories);
    let title = "Famous Quotes";
    res.render('stories/index', {
      stories,
      title
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }
})

// @desc    Show single story
// @route   GET /stories/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate('user').lean()

    if (!story) {
      return res.render('error/404')
    }

    if (story.user._id != req.user.id && story.status == 'private') {
      res.render('error/404')
    } else {
      res.render('stories/show', {
        story,
      })
    }
  } catch (err) {
    console.error(err)
    res.render('error/404')
  }
})

// @desc    Show edit page
// @route   GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
    }).lean()

    if (!story) {
      return res.render('error/404')
    }

    if (story.user != req.user.id) {
      res.redirect('/stories')
    } else {
      res.render('stories/edit', {
        story,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Update story
// @route   PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean()

    if (!story) {
      return res.render('error/404')
    }

    if(req.body.title == '' || req.body.body == '')
    {
      return res.render('error/Empty')
    }

    if (story.user != req.user.id) {
      res.redirect('/stories')
    } else {
      story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    Delete story
// @route   DELETE /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean()

    if (!story) {
      return res.render('error/404')
    }

    if (story.user != req.user.id) {
      res.redirect('/stories')
    } else {
      await Story.remove({ _id: req.params.id })
      res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})

// @desc    User stories
// @route   GET /stories/user/:userId
router.get('/user/:userId', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean()

    res.render('stories/index', {
      stories,
    })
  } catch (err) {
    console.error(err)
    res.render('error/500')
  }

})

router.get('/delete/:storyId', ensureAuth, async (req, res) => {
  try {
    let storyId = req.params.storyId;
    
    let user = req.user;

    for(let i=0;i<user.favourites.length;i++)
    {
      if(user.favourites[i] == storyId){
        user.favourites.splice(i,1);
      }
    }

    // for(let i=0;i<user.favourites.length;i++)
    // {
    //   console.log(user)
    // }

    user.save();

    res.redirect('/stories/showFavourite')
    
  } catch (err) {
    console.error(err)
    return res.render('error/500')
  }
})


module.exports = router
