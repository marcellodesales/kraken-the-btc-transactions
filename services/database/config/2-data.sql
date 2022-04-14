--##
--# Copyright ©️ Marcello DeSales - All Rights Reserved
--# Unauthorized copying of this file, via any medium is strictly prohibited
--# Proprietary and confidential for the purpose of Interview with Kraken's Engineering.
--# Written by Marcello DeSales <marcello.desales@gmail.com>, April 2022.
--##

-- Initial users and wallets https://github.com/marcellodesales/kraken-the-btc-transactions/blob/master/docs/Requirements-Analysis.md#-known-customers
-- Insert last value: https://stackoverflow.com/questions/6560447/can-i-use-return-value-of-insert-returning-in-another-insert/6560530#6560530

-- Wesley Crusher 	mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ
INSERT
INTO bitcoin.wallets("wallet_address")
VALUES('mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ');
INSERT
INTO bitcoin.users("first_name", "last_name")
VALUES ('Wesley', 'Crusher') RETURNING "user_id";
INSERT
INTO bitcoin.wallets_x_users ("wallet_address", "user_id")
VALUES ('mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ', lastval());

-- Leonard McCoy 	mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp
INSERT
INTO bitcoin.wallets("wallet_address")
VALUES('mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp');
INSERT
INTO bitcoin.users("first_name", "last_name")
VALUES ('Leonard', 'McCoy') RETURNING "user_id";
INSERT
INTO bitcoin.wallets_x_users ("wallet_address", "user_id")
VALUES ('mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp', lastval());

-- Jonathan Archer 	mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n
INSERT
INTO bitcoin.wallets("wallet_address")
VALUES('mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n');
INSERT
INTO bitcoin.users("first_name", "last_name")
VALUES ('Jonathan', 'Archer') RETURNING "user_id";
INSERT
INTO bitcoin.wallets_x_users ("wallet_address", "user_id")
VALUES ('mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n', lastval());

-- Jadzia Dax 	2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo
INSERT
INTO bitcoin.wallets("wallet_address")
VALUES('2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo');
INSERT
INTO bitcoin.users("first_name", "last_name")
VALUES ('Jadzia', 'Dax') RETURNING "user_id";
INSERT
INTO bitcoin.wallets_x_users ("wallet_address", "user_id")
VALUES ('2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo', lastval());

-- Montgomery Scott 	mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8
INSERT
INTO bitcoin.wallets("wallet_address")
VALUES('mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8');
INSERT
INTO bitcoin.users("first_name", "last_name")
VALUES ('Montgomery', 'Scott') RETURNING "user_id";
INSERT
INTO bitcoin.wallets_x_users ("wallet_address", "user_id")
VALUES ('mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8', lastval());

-- James T. Kirk 	miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM
INSERT
INTO bitcoin.wallets("wallet_address")
VALUES('miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM');
INSERT
INTO bitcoin.users("first_name", "last_name")
VALUES ('James', 'T. Kirk') RETURNING "user_id";
INSERT
INTO bitcoin.wallets_x_users ("wallet_address", "user_id")
VALUES ('miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM', lastval());

-- Spock 	mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV
INSERT
INTO bitcoin.wallets("wallet_address")
VALUES('mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV');
INSERT
INTO bitcoin.users("first_name")
VALUES ('Spock') RETURNING "user_id";
INSERT
INTO bitcoin.wallets_x_users ("wallet_address", "user_id")
VALUES ('mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV', lastval());