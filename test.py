Here is the code part 01, please take note of it first

#Tokenizer to split sentences into a list of words
word_tokenizer = spacy.load("en_core_web_sm")


class Vocabulary():
  """
  Class to convert the captions to index sequential tensors

  Args:
    freq_threshold (int, optional): How many times a word has to appear in dataset before it can be added to the vocabulary. Defaults to 2

  """

  def __init__(self, freq_threshold:int=2):
    self.itos = {0:"<PAD>", 1:"<SOS>", 2:"<EOS>", 3:"<UNK>"} #index to sentence
    self.stoi = {"<PAD>": 0, "<SOS>":1, "<EOS>": 2, "<UNK>":3} #sentence to index
    self.freq_threshold = freq_threshold #threshold for adding a word to the vocab

  def __len__(self):
    return len(self.itos)

  @staticmethod
  def tokenizer_eng(text):
    #convert sentence to list of words
    return [tok.text.lower() for tok in word_tokenizer.tokenizer(text)] #convert sentence to words


  def build_vocabulary(self, sentence_list):
    frequencies = {}
    idx = 4 #0-3 are for special tokens

    for sentence in sentence_list:
      for word in self.tokenizer_eng(sentence): #convert sentence to words
        if word not in frequencies:
          frequencies[word] = 1
        else:
          frequencies[word] += 1

        if frequencies[word] == self.freq_threshold: #once met freq_threshold, add to vocab list
          self.stoi[word] = idx
          self.itos[idx] = word
          idx += 1

  def numericalize(self, text):
    tokenized_text = self.tokenizer_eng(text) #convert annnotations to labels by converting each word to the index inside the vocab, else UNK tag
    return [
        self.stoi[token] if token in self.stoi else self.stoi["<UNK>"]
        for token in tokenized_text
    ]

class CustomDataset(Dataset):

    """
    Class to setup the custom Dataset for pyTorch Dataloader

    Args:
        Note: the order of the csv_file and root_dir are directly related, csv_file[0] contains captions for images in root_dir[0]
        
        csv_file (list): Lists of path to CSV files with annotations.
        root_dir (list): List of directory containing images.
        img_size (tuple, optional): Image size in the format (width, height), defaults to (256,256)
        transform (callable, optional): Optional torchvision transform to be applied on a sample, defaults to None
        freq_threshold (int, optional): Freq threshold for Vocabulary Class, defaults to 2
        vocabulary (Vocabulary, optional): Determines to use an existing vocabulary or create own, defaults to None
    Returns:
        image: transformed image
        labels: tensor object of the labels
        all_image_captions: list containing all the captions of the image
    """

    def __init__(self, csv_file:list, root_dir:list, img_size:tuple=(256,256), transform=None, freq_threshold=2, vocabulary=None):
        
        #dataframe with col name ['image_filename', 'image_captions'] from csv file
        self.annotations = pd.DataFrame()
        #list containing the int boundary on which image path to look at
        #list will containing the num of images in directory which is the boundary
        self.root_dir_boundary = []
        
        for idx, label_files in enumerate(csv_file): 
            labels = pd.read_csv(label_files, index_col=0) #remove index col
            self.annotations = pd.concat([self.annotations, labels], ignore_index=True) #merging annotations into 1 dataset

            #getting the image boundary on which idx belongs to which image file path
            if idx == 0: 
                self.root_dir_boundary.append(len(labels))
            else:
                #get the number of images in root directory and add with the previous to get the range of index that are in this filepath
                self.root_dir_boundary.append(self.root_dir_boundary[idx-1] + len(labels))

        self.root_dir = root_dir
        self.transform = transform
        self.img_size = img_size

        #initialise vocabulary
        if vocabulary == None:
            self.vocab = Vocabulary(freq_threshold)
            self.vocab.build_vocabulary(self.annotations.iloc[:,1].to_list()) #build vocab with all captions
        else:
            self.vocab = vocabulary

    def __len__(self):
        return len(self.annotations)


    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()

        img_name = self.annotations.iloc[idx, 0] #Image name as column 0
        #finding the correct root directory filepath in the list does the image belong to
        image_dir_idx = 0
        while idx >= self.root_dir_boundary[image_dir_idx] and image_dir_idx < len(self.root_dir_boundary):
            image_dir_idx += 1

        img_path = f"{self.root_dir[image_dir_idx]}/{img_name}"

        image = Image.open(img_path)
        image = ImageOps.pad(image, self.img_size) #resize image
        annotation = self.annotations.iloc[idx, 1] #Annotation as column 1
        
        #converting caption to index tensor
        numercalized_annotations = [self.vocab.stoi["<SOS>"]]
        numercalized_annotations += self.vocab.numericalize(annotation)
        numercalized_annotations.append(self.vocab.stoi["<EOS>"])

        #create list of all captions associated with the image (for BLEU & ROUGE score)
        all_img_captions = self.annotations[self.annotations['image_filename'] == img_name]

        if self.transform:
            image = self.transform(image)

        return image, torch.tensor(numercalized_annotations), all_img_captions.iloc[:,1].to_list()


class padAnnotations():
  """
  Collate function to pad all caption to the same length as max(len(caption)) in a batch

  Args:
    pad_idx (int): Index Label for the <PAD> token
    batch_first (boolean, optional): Decide if the dataset labels should be batch first
                                     Either returns (batch size, seq length) or (seq length, batch size)
  
  Returns:
    img: batch image object
    labels: batch of tensors of the captions, converted to the same length by adding <PAD>
    all_labels: batch of lists of the captions of the images
  """
  def __init__(self, pad_idx, batch_first = False):
    self.batch_first = batch_first
    self.pad_idx = pad_idx

  def __call__(self, batch):
    imgs = [item[0].unsqueeze(0) for item in batch] 
    imgs = torch.cat(imgs, dim=0)
    labels = [item[1] for item in batch]
    labels = torch.nn.utils.rnn.pad_sequence(labels, batch_first=self.batch_first, padding_value=self.pad_idx)
    all_labels = [item[2] for item in batch]

    return imgs, labels, all_labels

image_size = (299,299)
batch_size = 64

#Define transforms for image preprocessing
train_transform = transforms.Compose([
    transforms.Resize(image_size),
    transforms.TrivialAugmentWide(),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                     std=[0.229, 0.224, 0.225]),
])

#No data augmentation
eval_transform = transforms.Compose([
    transforms.Resize(image_size),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                     std=[0.229, 0.224, 0.225]),
])

### Example of when trying more than 1 dataset source

#Create a custom dataset with more than 1 dataset source
test_dataset = CustomDataset(csv_file=['../input/Landscape/Train/Labels/Blip_Label.csv', '../input/Landscape/Train/Labels/Kosmos_Label.csv', '../input/Flicker8k/Train/Labels/Label.csv'],
                        root_dir=['../input/Landscape/Train/Images', '../input/Landscape/Train/Images', '../input/Flicker8k/Train/Images'],
                        transform=train_transform,
                        img_size=image_size)


#Create a PyTorch DataLoader
#batch first
bf_test_dataloader = DataLoader(test_dataset, 
                        batch_size=batch_size,
                        shuffle=True,
                        collate_fn = padAnnotations(
                            pad_idx = test_dataset.vocab.stoi["<PAD>"], 
                            batch_first=True
                        ))

#not batch first
test_dataloader = DataLoader(test_dataset,
                        batch_size=batch_size,
                        shuffle=True,
                        collate_fn = padAnnotations(
                            pad_idx = test_dataset.vocab.stoi["<PAD>"]
                        ))

# Actual dataset for this notebook

#Create train dataset
dataset = CustomDataset(csv_file=['../input/Landscape/Train/Labels/Blip_Label.csv'],
                        root_dir=['../input/Landscape/Train/Images'],
                        transform=train_transform,
                        img_size=image_size)

#Create val and test dataset, note that
#1. transform uses eval transform with no data augmentation
#2. vocab is the original train dataset vocab (to map the correct index)
val_dataset = CustomDataset(csv_file=['../input/Landscape/Validation/Labels/Blip_Label.csv'],
                        root_dir=['../input/Landscape/Validation/Images'],
                        transform=eval_transform,
                        img_size=image_size,
                        vocabulary=dataset.vocab)

test_dataset = CustomDataset(csv_file=['../input/Landscape/Test/Labels/Blip_Label.csv'],
                        root_dir=['../input/Landscape/Test/Images'],
                        transform=eval_transform,
                        img_size=image_size,
                        vocabulary=dataset.vocab)


#create dataloaders, just update the dataset it is from
train_dataloader = DataLoader(dataset,
                        batch_size=batch_size,
                        shuffle=True,
                        collate_fn = padAnnotations(
                            pad_idx = dataset.vocab.stoi["<PAD>"]
                        ))

val_dataloader = DataLoader(val_dataset,
                        batch_size=batch_size,
                        shuffle=True,
                        collate_fn = padAnnotations(
                            pad_idx = dataset.vocab.stoi["<PAD>"]
                        ))

test_dataloader = DataLoader(test_dataset,
                        batch_size=batch_size,
                        shuffle=True,
                        collate_fn = padAnnotations(
                            pad_idx = dataset.vocab.stoi["<PAD>"]
                        ))


Here is my model. Please take note

# CNN encoder (using inceptionV3)
class EncoderCNN(torch.nn.Module):
  def __init__(self, embed_size, train_CNN=False):
    super(EncoderCNN, self).__init__()
    self.train_CNN = train_CNN
    self.inception = models.inception_v3(weights=models.Inception_V3_Weights.DEFAULT)
    self.inception.aux_logits=False #prevent training
    #converting the last layer of inception to linear layer [inception last layer input, embed size]
    self.inception.fc = torch.nn.Linear(self.inception.fc.in_features, embed_size) 
    self.relu = torch.nn.ReLU()
    self.dropout = torch.nn.Dropout(p=0.5)

  def forward(self, images):
    features = self.inception(images)

    for name, param in self.inception.named_parameters():
      if "fc.weight" in name or "fc.bias" in name:
        param.requires_grad = True #allowing the last layer to be fine tuned but we are freezing the rest

      else:
        param.requires_grad = self.train_CNN

    return self.dropout(self.relu(features))

class PositionalEncoding(torch.nn.Module):
    def __init__(self, embed_size, dropout=0.1, max_len=5000):
        super(PositionalEncoding, self).__init__()
        self.dropout = torch.nn.Dropout(p=dropout)
        
        position = torch.arange(max_len).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, embed_size, 2) * -(torch.log(torch.tensor(10000.0)) / embed_size))
        pe = torch.zeros(max_len, 1, embed_size)
        pe[:, 0, 0::2] = torch.sin(position * div_term)
        pe[:, 0, 1::2] = torch.cos(position * div_term)
        self.register_buffer('pe', pe)

    def forward(self, x):
        x = x + self.pe[:x.size(0)]
        return self.dropout(x)

class DecoderTransformer(torch.nn.Module):
  def __init__(self, embed_size, hidden_size, vocab_size, num_layers, dropout=0.5):
    super(DecoderTransformer, self).__init__()
    self.embed = torch.nn.Embedding(vocab_size, embed_size)
    self.pos_encoder = PositionalEncoding(embed_size, dropout)
    transformer_decoder_layer = TransformerDecoderLayer(d_model=embed_size, nhead=hidden_size // 64, dropout=dropout)
    self.transformer_decoder = TransformerDecoder(transformer_decoder_layer, num_layers=num_layers)
    self.fc_out = torch.nn.Linear(embed_size, vocab_size)
    self.dropout = torch.nn.Dropout(dropout)

  def generate_square_subsequent_mask(self, sz):
    mask = (torch.triu(torch.ones(sz, sz)) == 1).transpose(0, 1)
    mask = mask.float().masked_fill(mask == 0, float('-inf')).masked_fill(mask == 1, float(0.0))
    return mask

  def forward(self, features, captions):
    features = features.squeeze(1)  # Adjust features to [batch_size, embed_size]
    captions_embed = self.embed(captions)  # [seq_len, batch_size, embed_size]
    captions_embed = self.pos_encoder(captions_embed)
    tgt_mask = self.generate_square_subsequent_mask(captions.size(0)).to(features.device)
    output = self.transformer_decoder(tgt=captions_embed, memory=features.unsqueeze(0), tgt_mask=tgt_mask)
    output = self.fc_out(output)
    return output
  
class CNNtoRNN(torch.nn.Module):
  def __init__(self, embed_size, hidden_size, vocab_size, num_layers):
    super(CNNtoRNN, self).__init__()
    self.encoderCNN = EncoderCNN(embed_size)
    self.decoderTransformer = DecoderTransformer(embed_size, hidden_size, vocab_size, num_layers)

  #for training with a caption
  def forward(self, images, captions):
    features = self.encoderCNN(images).unsqueeze(1) # Adjust for transformer expected shape
    outputs = self.decoderTransformer(features, captions)
    return outputs

  #for prediction where there is a semi caption and they have to continue the caption
  def caption_image(self, image, vocabulary, max_length=50):
    result_caption = []

    with torch.no_grad(): #no training
      features = self.encoderCNN(image).unsqueeze(0) #image as input
      features = features.unsqueeze(1)  # Adjust for transformer expected shape

      input_tokens = torch.tensor([vocabulary.stoi["<SOS>"]]).unsqueeze(0).to(features.device)

      for _ in range(max_length):
        output = self.decoderTransformer(features, input_tokens)
        predicted = output.argmax(2)[:, -1]  # Take the most likely next word

        result_caption.append(predicted.item())
        if vocabulary.itos[predicted.item()] == "<EOS>":
          break
        
        # Concatenate the predicted word for the next input
        input_tokens = torch.cat((input_tokens, predicted.unsqueeze(0)), dim=1)

    return [vocabulary.itos[idx] for idx in result_caption]  #get the string from the vocabulary instead of the indices


Now when training the model, the loss function seems to keep erroring out. I just want to compute loss from the criterion passed down which is defined in the code below. Please fix the loss calculation so i can output loss for each epoch

def decode_predictions(outputs, batch_first:bool, vocabulary:Vocabulary):
    """
    Function to convert model tensor outputs to sentences

    Args:
        outputs (torch tensor object): Model's output to be decoded, either in size (seq len, batch, vocab_size) or (batch, seq len, vocab_size)
        batch_first (bool): Boolean of if dataloader was configured to batch_first
        vocabulary (Vocabulary): dataset Vocabulary Class for decoding

    Returns:
        list of predicted sentences each corresponding to 1 sample in the batch
            - will be of length (batch_size)
            eg. ['predicted sentence 1 for sample 1', ...'predicted sentence N for sample N']
    
    """

    all_prediction = []
    predicted_tokens = outputs.argmax(-1) #flatten vocab size dimensions
    if not batch_first:
        predicted_tokens = predicted_tokens.T 
    
    for sentence_tokens in predicted_tokens:
        sentence_tokens = sentence_tokens.tolist()

        try:
            #cropping predicted sentence to first EOS
            eos_index = sentence_tokens.index(vocabulary.stoi['<EOS>']) #get first instance of <EOS> to crop sentence accordingly
            predicted_sentence = sentence_tokens[:eos_index]
        except:
            predicted_sentence = sentence_tokens

        try:
            #getting predicted_sentence by remove <SOS>
            predicted_sentence.remove(vocabulary.stoi['<SOS>'])
        except:
            pass
    
        all_prediction.append(" ".join([vocabulary.itos[idx] for idx in predicted_sentence]))

    return all_prediction

# compute loss function
def compute_loss(outputs, targets, criterion, pad_index):
    # Assume outputs are [seq_len, batch_size, num_classes], targets are [seq_len, batch_size]
    batch_size, seq_len, _ = outputs.shape
    mask = (targets != pad_index)  # Create a mask for non-pad tokens

    # Reshape outputs and targets to [-1, num_classes] and [-1] respectively
    outputs = outputs.reshape(-1, outputs.size(-1))
    targets = targets.reshape(-1)

    # Apply mask to outputs and targets
    outputs_masked = outputs[mask.reshape(-1)]
    targets_masked = targets[mask.reshape(-1)]

    # Compute loss using only the non-masked (non-pad) tokens
    loss = criterion(outputs_masked, targets_masked)
    
    return loss

def eval(model, 
         criterion, 
         dataloader, 
         batch_first:bool, 
         vocabulary:Vocabulary, 
         device:str):
    """
    Function to evaluate model performance

    Args:
        model: The model that is to be evaluated
        criterion: Loss criterion of the model
        dataloader: validation / test dataset
        batch_first (bool): boolean if dataloader samples tensor are (batch, seq len) or (seq len, batch)
        vocabulary (Vocabulary): dataset vocabulary class
        device (str): cpu or cuda

    Returns:
        avg_val_loss: average validation loss
        Bleu_score: dictionary of BLEU 1-4 score
        Rouge_score: dictionary of Rouge  1,2,L,LSum score
    """
    
    model.eval()

    total_val_loss = 0

    #BLEU predictions container
    predictions = []
    references = []
    
    with torch.no_grad():
        for idx, (imgs, annotations, all_annotations) in enumerate(dataloader):
            #getting img and annotations
            imgs = imgs.to(device)
            annotations = annotations.to(device)
            #running model prediction
            outputs = model(imgs, annotations[:-1]) #training model to guess the last word
            
            #updating model parameters
            loss = compute_loss(outputs.permute(1, 2, 0), annotations[:, :-1].permute(1, 0), criterion, dataset.vocab.stoi["<PAD>"])
            total_val_loss += loss.item()

            #get model predictions and update
            predictions.extend(decode_predictions(outputs, batch_first, vocabulary))

            #update references
            references.extend(all_annotations)

        Bleu_score = get_bleu_score(predictions, references)
        Rouge_score = get_rouge_score(predictions, references)

        return total_val_loss/(idx+1), Bleu_score, Rouge_score


def train(model, 
          criterion, 
          optimiser, 
          train_dataloader, 
          val_dataloader, 
          batch_first:bool, 
          vocabulary:Vocabulary, 
          device:str, 
          num_epochs:int, 
          show_train_metrics:bool=None, 
          save_every:int=None,
          model_name:str=None, 
          overwrite:bool=False):
    
    """
    Function to train the model

    Args:
        model: The model that is to be evaluated
        criterion: Loss criterion of the model
        optimiser: Optimiser function of the model
        train_dataloader: Train dataset
        val_dataloader: Validation dataset, use None if no Validation dataset
        batch_first (bool): Boolean if dataloader samples tensor are (batch, seq len) or (seq len, batch)
        vocabulary (Vocabulary): Dataset vocabulary class
        device (str): cpu or cuda
        num_epochs (int): Number of epochs for training
        show_train_metrics (bool, optional): Booleon on should calculate BLEU & Rouge score during training, defaults to False
        save_every (int, optional): Save model after every ___ epochs, defaults to None (no saving)
        model_name (str, optional): Model Name to be saved after, required if save_every != None, model will be saved as (model_name)_epoch or just model_name
        overwrite (bool, optional): Boolean on overwriting model saves or saving each specific epoch as a new model, defaults to False
    
    Returns
        train_loss: list of average training loss per epoch
        train_bleu: list of dictionary of training BLEU score per epoch, [] if show_train_metric = False
        train_rouge: list of dictionary of training Rouge score per epoch, [] if show_train_metric = False
        val_loss: list of average validation loss per epoch, [] if val_dataloader = None
        val_bleu: list of dictionary of validation BLEU score per epoch, [] if val_dataloader = None
        val_rouge: list of dictionary of validation Rouge score per epoch, [] if val_dataloader = None
    
    """
    
    #initialise results container
    train_loss = []
    train_bleu = []
    train_rouge = []

    val_loss = []
    val_bleu = []
    val_rouge = []

    for epoch in range(num_epochs):

        total_train_loss = 0

        #BLEU predictions container
        predictions = []
        references = []

        #start model training
        model.train()
        for idx, (imgs, annotations, all_annotations) in enumerate(train_dataloader):
            
            #getting img and annotations
            imgs = imgs.to(device)
            annotations = annotations.to(device)
            #running model prediction
            outputs = model(imgs, annotations[:-1]) #training model to guess the last word
            
            #updating model parameters
            loss = compute_loss(outputs.permute(1, 2, 0), annotations[:, :-1].permute(1, 0), criterion, dataset.vocab.stoi["<PAD>"])
            optimiser.zero_grad() #remove optimiser gradient
            loss.backward()
            optimiser.step()
            
            #calculate loss and update it for each batch
            total_train_loss += loss.item()

            if show_train_metrics:
                #get model predictions and update
                predictions.extend(decode_predictions(outputs, batch_first, vocabulary))

                #update references
                references.extend(all_annotations)

        if show_train_metrics:   
            #calculating bleu and rouge score
            Bleu_score = get_bleu_score(predictions, references)
            Rouge_score = get_rouge_score(predictions, references)
            train_bleu.append(Bleu_score)
            train_rouge.append(Rouge_score)

        #updating values
        train_loss.append(total_train_loss/(idx+1))

        if val_dataloader != None:
            #validation
            avg_val_loss, val_bleu_score, val_rouge_score = eval(
                                                                model=model,
                                                                criterion=criterion,
                                                                dataloader=val_dataloader,
                                                                batch_first=batch_first,
                                                                vocabulary=vocabulary,
                                                                device=device
                                                            )
            
            val_loss.append(avg_val_loss)
            val_bleu.append(val_bleu_score)
            val_rouge.append(val_rouge_score)

        #printing progress
        if num_epochs <= 10 or (num_epochs >10 and (epoch+1)%5 == 0):
            print(f"Epoch {epoch+1} completed\navg training loss per batch: {total_train_loss/(idx+1)}")
            
            if show_train_metrics:
                print(f"train bleu score:{Bleu_score}\ntrain rouge score: {Rouge_score}\n")

            if val_dataloader != None:
                print(f"avg validation loss per batch: {avg_val_loss}\nval bleu score: {val_bleu_score}\nval rouge score: {val_rouge_score}")

            print("------------------------------------------------------------------")
            
        #saving model
        if save_every != None and (epoch+1)%save_every == 0:
            try:
                if overwrite:
                    torch.save(model.state_dict(), f"../models/image_captioning/{model_name}.pt")
                else:
                    torch.save(model.state_dict(), f"../models/image_captioning/{model_name}_{epoch+1}.pt")
            except:
                print(f"Unable to save model at epoch {epoch+1}")

    return train_loss, train_bleu, train_rouge, val_loss, val_bleu, val_rouge

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

#hyper parameters
embed_size = 256
hidden_size = 256
vocab_size = len(dataset.vocab)
num_layers = 3
learning_rate = 3e-4
num_epochs = 100
save_every = 50
model_name = "CNNLSTM"


print(device)

model = CNNtoRNN(embed_size, hidden_size, vocab_size, num_layers).to(device)
criterion = torch.nn.CrossEntropyLoss(ignore_index=dataset.vocab.stoi["<PAD>"])
optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

train_loss, train_bleu, train_rouge, val_loss, val_bleu, val_rouge = train(
    model=model,
    criterion=criterion,
    optimiser=optimizer,
    train_dataloader=train_dataloader,
    val_dataloader=val_dataloader,
    batch_first=False,
    vocabulary=dataset.vocab,
    device=device,
    num_epochs=10,
    show_train_metrics=False,
    save_every=10,
    model_name="CNNLSTM",
    overwrite=True
)

#loading example model
test_model = CNNtoRNN(embed_size, hidden_size, vocab_size, num_layers).to(device)
test_criterion = torch.nn.CrossEntropyLoss(ignore_index=dataset.vocab.stoi["<PAD>"])
test_model.load_state_dict(torch.load('../models/image_captioning/CNNLSTM.pt'))

test_loss, test_bleu, test_rouge = eval(
    model=test_model,
    criterion=test_criterion,
    dataloader=test_dataloader,
    batch_first=False,
    vocabulary=test_dataset.vocab,
    device=device
)

print(f"Test Loss: {test_loss}\nTest BLEU:{test_bleu}\nTest Rouge:{test_rouge}")

