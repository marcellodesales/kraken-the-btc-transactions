# 🎯 Functional Requirement

> The data we work with in this scenario comes from bitcoind’s rpc call listsinceblock. 
> A frequently used approach to detect incoming deposits is to periodically call listsinceblock and process the returned data. 
>   * From the calls to [listsinceblock](https://developer.bitcoin.org/reference/rpc/listsinceblock.html)

> `Your task is to write code that processes those files and detects all valid incoming deposits`

1. Process input files from the bitcoin daemon
2. Detect all valid incoming `deposits`

* `These instructions do not specify every single detail you should take into consideration.`
* `Keep in mind that your code will determine how much money each customer will get.`

> **GOAL**: Process transactions and filter them for valid deposits.
> **Note**: A deposit is considered valid when it has at least 6 confirmations.

## 👥 Known Customers

> Known customer addresses are:

| Customer Name | Wallet Address |
| --- | --- |
| Wesley Crusher | mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ |
| Leonard McCoy | mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp |
| Jonathan Archer |  mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n |
| Jadzia Dax | 2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo |
| Montgomery Scott | mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8 | 
| James T. Kirk |  miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM |
| Spock | mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV| 

## 🎣 Input

1. Read all transactions from `transactions-1.json` and `transactions-2.json`
2. Store all deposits in a database of your choice.

## 🔊 Existing Users Transactions

> **MUST** contain the `count of valid deposits` and `their sum` for the respective customer.

* 📝 That is, present on the list of known wallets

```
Deposited for Wesley Crusher: count=n sum=x.xxxxxxxx
Deposited for Leonard McCoy: count=n sum=x.xxxxxxxx
Deposited for Jonathan Archer: count=n sum=x.xxxxxxxx
Deposited for Jadzia Dax: count=n sum=x.xxxxxxxx
Deposited for Montgomery Scott: count=n sum=x.xxxxxxxx
Deposited for James T. Kirk: count=n sum=x.xxxxxxxx
Deposited for Spock: count=n sum=x.xxxxxxxx
```

## 🔊 Unknown Users Transactions

> **MUST** be the `count and the sum of the valid deposits` to `addresses that are not associated with a known customer`.

* 📝 That is, not present on the list of known wallets

```
Deposited without reference: count=n sum=x.xxxxxxxx
```

## 🔊 Aggregate Min/Max Transaction Values

```
Smallest valid deposit: x.xxxxxxxx
Largest valid deposit: x.xxxxxxxx
```

# ⛓️ Blockchain 

![image](https://user-images.githubusercontent.com/131457/162597458-6256c312-4abb-4788-8586-edce9a1727d1.png)

> * Raw Data: https://learnmeabitcoin.com/technical/blkdat
> `Blocks are not downloaded in order as seen in the json output`

# ❓From Each Transaction 

> * **Data Format**: https://developer.bitcoin.org/reference/rpc/listsinceblock.html#result
> * **Transactions**: https://www.bitcoin.com/get-started/how-to-send-bitcoin/

![image](https://user-images.githubusercontent.com/131457/162597471-ca753326-529a-4a19-b977-16c9da7bd1de.png)


## 💰 how to identify transactions identity by the wallet's address?

* Transaction field `address` and the wallet address on the known user's table
* When not in the list, it will be collected as `unknown` 

## 💡 How are valid transactions identified?

* Transaction field `confirmations >= 6`

## 🏁 What's the amount of a deposit among transactions?

* Transaction field `category=receive`
* Transaction field `amount > 0`
  * Since the user must be receiving some value

## 🕵🏻‍♂️ What values are needed from the transactions?

> * After the transaction has been deemed valid as per above
> * Values only required to answer the requirements

* PID: We have the field `txid`
* User's Wallet: field `address`
* Total: field `amount`

## 🎞️ Should we sort the transactions by time?

* Noticed that block on `lastblock` is in the middle of the transactions
* Should we analyze the transactions in a sorted manner?
  * Would it give indications if the values are correct?
  * Should we trust the data in the files? Were they manipulated before?

## 👎 What we should NOT consider?

* We are NOT counting the current user's wallet amount
* We are NOT counting how much a user spent

> * **NOTE**: According to the requirements, we should only print the values received
> * **NOTE**: For instance, how much in fees, which is only included in those transactions whose `category = send`

# 💯 Verifying Data

> Using JQ to analyze the data, some functions used:
>   * sort: https://stackoverflow.com/questions/70492898/using-jq-how-to-sort-array-of-object/70493529#70493529
>   * filter: https://stackoverflow.com/questions/26701538/how-to-filter-an-array-of-objects-based-on-values-in-an-inner-array-with-jq/26701851#26701851
>   * Arrays: https://github.com/stedolan/jq/issues/124#issuecomment-757977583
>   * Aggregates: https://stackoverflow.com/questions/48321235/sql-style-group-by-aggregate-functions-in-jq-count-sum-and-etc/61394090#61394090

## 🧮 Sorted Received Transactions

> Queries to help understand the problem better

| Description | Query | transactions1.json | transactions2.json |
| -- | -- | -- | ---|
| All valid transactions | `[.transactions \| map(select(.confirmations >= 6)) \| sort_by(.time) \| .[] \| .]` | https://jqplay.org/s/DPkOq22gPR | https://jqplay.org/s/JIBFnMyM1c |
| All transactions Grouped by Blockhash | `.transactions \| group_by(.blockhash) \| map({ blockhash: .[0].blockhash, count: map(.txid) \| length, txs: map({txid: .txid, time: .time, category: .category, amount: .amount, conf: .confirmations, address: .address})})` | https://jqplay.org/s/bJ-LfihNye | x |
| All `valid` `received` transactions `by address` | `[.transactions \| map(select(.category == "receive")) \| map(select(.confirmations >= 6)) \| map(select(.amount > 0)) \| sort_by(.time) \| .[] \| .] \| group_by(.address) \| map({ address: .[0].address, count: map(.txid) \| length, txs: map({txid: .txid, amount: .amount})})` | https://jqplay.org/s/Vwuqs7ZZCL | x |
| All `valid` `received` aggregated amounts `by address` | `[.transactions \| map(select(.category == "receive")) \| map(select(.confirmations >= 6)) \| map(select(.amount > 0)) \| sort_by(.time) \| .[] \| .] \| group_by(.address) \| map({ address: .[0].address, count: map(.txid) \| length, total: map(.amount) \| add, max: map(.amount) \| max, min: map(.amount) \| min})` | https://jqplay.org/s/weXDSQzPAo | x |

Looking at the data, I have merged both datasets and produced an output with jq to produce the desired views of the required output

## 🧮 List of aggregated deposits by unidentified wallets

> https://jqplay.org/s/YcoyByiguI

```jq
[
  .transactions 
  | map(select(.category == "receive")) 
  | map(select(.confirmations >= 6)) 
  | map(select(.amount > 0)) 
  | sort_by(.time) 
  | .[]
] 
| group_by(.address) 
| map({ address: .[0].address, txs: map(.txid) 
| length, total: map(.amount) 
| add, max: map(.amount) 
| max, min: map(.amount) 
| min}) 
| .[] 
| "Deposited for " + .address  + ": count=" + (.txs | tostring) + " sum=" + (.total | tostring)
```

### 🔊 Logs

> **NOTE**: This is for all wallets and must be further reduced by known wallet addresses

```yaml
Deposited for 2N1SP7r92ZZJvYKG2oNtzPwYnzw62up7mTo: count=16 sum=77.48000000000002
Deposited for mfcMTrQkpvxnVpTn29PLMU6wfcuHkngtLJ: count=1 sum=78.38942615
Deposited for mgA5rCr9xqmJW9x9KP11jkgAJfDzvZKuQA: count=1 sum=11.12906751
Deposited for mhpvDzCBTEZsbTcgYVicZJzdUetVZqHvyL: count=1 sum=23.52364281
Deposited for mi6uzSUpUXEufYkaE81M2YQ6iwj9FXCaoC: count=1 sum=93.91710954
Deposited for miTHhiX3iFhVnAEecLjybxvV5g8mKYTtnM: count=21 sum=1210.60058269
Deposited for mjWKAnQnPt6EmnE8E1ykz5C7nkAeDnC5U9: count=1 sum=42.73364674
Deposited for mjr6f8iYNWcWp7ThSS45hJvxCi62SXWGmL: count=1 sum=21.94627784
Deposited for mmFFG4jqAtw9MoCC88hw5FNfreQWuEHADp: count=18 sum=97
Deposited for mprRLA288azbaJaA7u3e8YmJT31q9EsjuB: count=1 sum=40.67704927
Deposited for mr18XPyx9xtB5m9mm3mK4ZXH9wbh9fxPhv: count=1 sum=46.57757195
Deposited for mrJsuFpg9VYhTnabpoWohtfLhDt9xAYhGt: count=1 sum=48.76294572
Deposited for ms6a8G3J5XcYiGJbyPHd9AAQ2FFVRRWDZt: count=1 sum=68.3270907
Deposited for msLPs18kdkPXPhTyTzmf6P5jEZo11EuZXv: count=1 sum=63.48231627
Deposited for msXuM1526uFqNnDBxh7P39dUYvdhZpvyrG: count=1 sum=15.26977473
Deposited for msZyCtZeeJejC9GYTP93trKfMqicssCPM3: count=2 sum=43.16711162
Deposited for muDwtNDAAn8348s9pey4CqTeTZR8pUsR9v: count=1 sum=98.04437945
Deposited for muRSs9C2DrAsy28k6C1nAnCNTwYPXpjsn1: count=1 sum=36.23267296
Deposited for mutrAf4usv3HKNdpLwVD4ow2oLArL6Rez8: count=27 sum=131.93252999999999
Deposited for muxu2q6v7uzsxiRLReX5XkFqCCfzke2KHK: count=1 sum=92.61634743
Deposited for mvMjHEUNsn1vVi4Evz8CGJ8AUJCfLZN4Q8: count=1 sum=75.01003828
Deposited for mvcyJMiAcSXKAEsQxbW9TYZ369rsMG6rVV: count=16 sum=827.6408870999999
Deposited for mvd6qFeVkqH6MNAS2Y2cLifbdaX5XUkbZJ: count=35 sum=183
Deposited for mwN3Y5D5a1QsgDJGLv5ybUMHFFcvDuz3zg: count=1 sum=17.33773303
Deposited for myAre6hq8uSDAzhmNit1fjkTeajebBzrKZ: count=1 sum=36.9759613
Deposited for myuPFnmpChJurtvdKCVVK5S4ZU9JcgSmoj: count=1 sum=28.62734149
Deposited for mzVyNg9tw4cjL3QnBhRVpRwRgxBDQTsaiV: count=1 sum=93.21009929
Deposited for mzzg8fvHXydKs8j9D2a8t7KpSXpGgAnk4n: count=30 sum=143.95000000000005
Deposited for n2pzbd51D3x3yXM1z8T9UvHoygMXoDX3T4: count=1 sum=32.47504722
Deposited for n38WL8p2fa3BpJDnMUXQfvdizPTWuwbPg9: count=1 sum=65.03828679
```

## 🧮 Smallest valid deposit

> https://jqplay.org/s/Ra65tyMzhy

```jq
[
  .transactions 
  | map(select(.category == "receive")) 
  | map(select(.confirmations >= 6)) 
  | map(select(.amount > 0)) 
  | .[]
] 
| group_by(.address) 
| map({ min: map(.amount) | min})
| ([ .[].min ] | min) as $m 
| map(select(.min== $m)) 
| "Smallest valid deposit: " + (.[0].min | tostring)
```

### 🔊 Logs

```yaml
Smallest valid deposit: 1e-07
```

## 🧮 Largest valid deposit

> https://jqplay.org/s/p3XRGfxv32

```jq
[
  .transactions 
  | map(select(.category == "receive")) 
  | map(select(.confirmations >= 6)) 
  | map(select(.amount > 0)) 
  | .[]
] 
| group_by(.address) 
| map({ max: map(.amount) | max}) 
| ([ .[].max ] | max) as $m 
| map(select(.max== $m)) 
| "Largest valid deposit: " + (.[0].max | tostring)
```

### 🔊 Logs

```yaml
Largest valid deposit: 99.61064066
```

## 🧮 Scientific Numeric Data Conversion

> * Some amount is in scientific notation (for storage purpose?), so make sure to convert before computing (if not done automatically)
  * `1.1e-07`: [1.1 x 10^-7](https://calculator.name/scientific-notation-to-decimal/1e-7)

> https://jqplay.org/s/4VMFQ2hYpg

```jq
def to_decimal:
  def rpad(n): if (n > length) then . + ((n - length) * "0") else . end;
  def lpad(n): if (n > length) then ((n - length) * "0") + . else . end;

  tostring
  | . as $s
  | capture( "(?<sgn>[+-]?)(?<left>[0-9]*)(?<p>\\.?)(?<right>[0-9]*)(?<e>[Ee]?)(?<exp>[+-]?[0-9]+)" )
  | if .e == "" then (if .sgn == "+" then $s[1:] else $s end)
    else (.left|length) as $len
    | (.exp|tonumber) as $exp
    | (if .sgn == "-" then "-" else "" end ) as $sgn
    | if $exp < 0 then "." + (.left | lpad(1 - $exp - $len)) + .right
      else (.left | rpad($exp - $len)) + "." + .right
      end
      | $sgn + .
    end ;

[.transactions 
  | map(select(.category == "receive")) 
  | map(select(.confirmations >= 6)) 
  | map(select(.amount > 0))
  | .[] | 
.]
| group_by(.address) 
| map({ address: .[0].address, txs: map(.txid) | length, total: map(.amount) | add, max: map(.amount) | max, min: map(.amount) | min}) 
| ([ .[].min ] | min) as $m | map(select(.min== $m)) | "Smallest valid deposit: " + (.[0].min | to_decimal)
```

### 🔊 Logs

```yaml
Smallest valid deposit: .0000001
```

# 🎯 Non-Functional Requirements

* It was suggested the following: backend service and database for storage

## 💻 Backend Service

* Node.js or any other

## 🔋 Data Storage

* To store all deposits in a database of your choice

## 🗃️ Process Management

* Docker Container

## 🐳 Orchestrator 

* Docker-Compose