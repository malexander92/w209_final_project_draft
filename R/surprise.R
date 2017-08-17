
# Pull the entropy library to later calculate KL Divergence
install.packages('entropy', dependencies = TRUE)
library(entropy)
library(tidyr)
library(dplyr)


setwd("~/Hacking/Berkeley/W209/w209_final_project_draft/data")
crimes<-read.csv("./Category_Crime_agg.csv")
crimes <- subset(crimes, Year != "2017")

# first do a spread / gather to make sure we have an entry for each crime for each year (even if it is 0)
crimes <- crimes %>% spread(PrimaryType, Count)
crimes <- crimes %>% gather(PrimaryType, Count, 3:37)
crimes[is.na(crimes)] <- 0

# For each year and zip code, create new entry called Total Crime
crimes <- crimes %>% spread(PrimaryType, Count)
crimes$'TOTAL CRIME' <- rowSums(crimes[,3:37])
crimes <- crimes %>% gather(PrimaryType, Count, 3:38)
  
  
# first do a spread / gather to make sure we have all zipcodes for all crimes for all years
crimes <- crimes %>% spread(zipcode, Count)
crimes <- crimes %>% gather(zipcode, Count, 3:57)
# replace NAs with 0
crimes[is.na(crimes)] <- 0
colnames(crimes)[3] <- "zipcode"
crimes$zipcode <- as.factor(crimes$zipcode)
crimes$PrimaryType <- as.factor(crimes$PrimaryType)

# crimes_total <- read.csv("./Crimes_-_2001_to_present.csv")
pop_zip<-read.csv("./pop_by_zip.csv")


# Force the column names to match what is in the crimes file
colnames(pop_zip) <- c("zipcode", "Population")






# Merge the crimes and population files
#crimes <- merge(crimes, pop_zip, by="zipcode")
# crimes <- merge(crimes, pop_zip, by="zipcode")
# crimes$CrimesPerThousand <- crimes$Count*1000/crimes$pop



# for each year and crime type, total occurrance of that crime

#merged_data$SurpriseRatio <- merged_data$CrimesPerThousand/merged_data$CitywideCrimesPerThousand

pois <- spread(crimes, Year, Count)
pois <- merge(pois, pop_zip, by="zipcode")




poisTest1 <- function(x){(poisson.test(c(as.numeric(x[3]),as.numeric(x[3])),as.numeric(x[19]))$p.value-1)*ifelse(x[3]<x[3],1,-1)}
poisTest2 <- function(x){(poisson.test(c(as.numeric(x[3]),as.numeric(x[4])),as.numeric(x[19]))$p.value-1)*ifelse(x[3]<x[4],1,-1)}
poisTest3 <- function(x){(poisson.test(c(as.numeric(x[4]),as.numeric(x[5])),as.numeric(x[19]))$p.value-1)*ifelse(x[4]<x[5],1,-1)}
poisTest4 <- function(x){(poisson.test(c(as.numeric(x[5]),as.numeric(x[6])),as.numeric(x[19]))$p.value-1)*ifelse(x[5]<x[6],1,-1)}
poisTest5 <- function(x){(poisson.test(c(as.numeric(x[6]),as.numeric(x[7])),as.numeric(x[19]))$p.value-1)*ifelse(x[6]<x[7],1,-1)}
poisTest6 <- function(x){(poisson.test(c(as.numeric(x[7]),as.numeric(x[8])),as.numeric(x[19]))$p.value-1)*ifelse(x[7]<x[8],1,-1)}
poisTest7 <- function(x){(poisson.test(c(as.numeric(x[8]),as.numeric(x[9])),as.numeric(x[19]))$p.value-1)*ifelse(x[8]<x[9],1,-1)}
poisTest8 <- function(x){(poisson.test(c(as.numeric(x[9]),as.numeric(x[10])),as.numeric(x[19]))$p.value-1)*ifelse(x[9]<x[10],1,-1)}
poisTest9 <- function(x){(poisson.test(c(as.numeric(x[10]),as.numeric(x[11])),as.numeric(x[19]))$p.value-1)*ifelse(x[10]<x[11],1,-1)}
poisTest10 <- function(x){(poisson.test(c(as.numeric(x[11]),as.numeric(x[12])),as.numeric(x[19]))$p.value-1)*ifelse(x[11]<x[12],1,-1)}
poisTest11 <- function(x){(poisson.test(c(as.numeric(x[12]),as.numeric(x[13])),as.numeric(x[19]))$p.value-1)*ifelse(x[12]<x[13],1,-1)}
poisTest12 <- function(x){(poisson.test(c(as.numeric(x[13]),as.numeric(x[14])),as.numeric(x[19]))$p.value-1)*ifelse(x[13]<x[14],1,-1)}
poisTest13 <- function(x){(poisson.test(c(as.numeric(x[14]),as.numeric(x[15])),as.numeric(x[19]))$p.value-1)*ifelse(x[14]<x[15],1,-1)}
poisTest14 <- function(x){(poisson.test(c(as.numeric(x[15]),as.numeric(x[16])),as.numeric(x[19]))$p.value-1)*ifelse(x[15]<x[16],1,-1)}
poisTest15 <- function(x){(poisson.test(c(as.numeric(x[16]),as.numeric(x[17])),as.numeric(x[19]))$p.value-1)*ifelse(x[16]<x[17],1,-1)}
poisTest16 <- function(x){(poisson.test(c(as.numeric(x[17]),as.numeric(x[18])),as.numeric(x[19]))$p.value-1)*ifelse(x[17]<x[18],1,-1)}

t1 <- apply(pois, 1, poisTest1)
t2 <- apply(pois, 1, poisTest2)
t2 <- apply(pois, 1, poisTest2)
t3 <- apply(pois, 1, poisTest3)
t4 <- apply(pois, 1, poisTest4)
t5 <- apply(pois, 1, poisTest5)
t6 <- apply(pois, 1, poisTest6)
t7 <- apply(pois, 1, poisTest7)
t8 <- apply(pois, 1, poisTest8)
t9 <- apply(pois, 1, poisTest9)
t10 <- apply(pois, 1, poisTest10)
t11 <- apply(pois, 1, poisTest11)
t12 <- apply(pois, 1, poisTest12)
t13 <- apply(pois, 1, poisTest13)
t14 <- apply(pois, 1, poisTest14)
t15 <- apply(pois, 1, poisTest15)
t16 <- apply(pois, 1, poisTest16)


final_pois <- cbind(pois[,1:2],data.frame(t1,t2,t3,t4,t5,t6,t7,t8,t9,t10,t11,t12,t13,t14,t15,t16))
colnames(final_pois) <- colnames(pois)[1:18]
final_pois <- final_pois %>% gather(Year, Count, 3:18)


crimes <- merge(crimes, pop_zip, by="zipcode")
colnames(crimes)[5] <- 'pop'
crimes$CrimesPerThousand <- crimes$Count*1000/crimes$pop

prior <- aggregate(Count ~ Year + PrimaryType, sum, data = crimes)
prior$Count <- prior$Count*1000/total_population
colnames(prior)[3] <-"CitywideCrimesPerThousand"
merged_data <- merge(x = crimes, y = prior, by = c("Year","PrimaryType"), all.x = T)


output_data <- cbind((merged_data %>% arrange(Year, zipcode)),final_pois[,4])
colnames(output_data)[8] <- "SurpriseRatio"
head(output_data,100)

write.csv(output_data, file="./category_crime_agg_v5.csv", row.names = FALSE)

